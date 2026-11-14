import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { assertAuthorizedStaff, db } from './authGuard';
import { EmailTemplatePayload, renderEmailTemplate } from './emailTemplates';

export const SMTP_HOST = defineSecret('SMTP_HOST');
export const SMTP_PORT = defineSecret('SMTP_PORT');
export const SMTP_USER = defineSecret('SMTP_USER');
export const SMTP_PASS = defineSecret('SMTP_PASS');
export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
export const EMAIL_FROM = defineSecret('EMAIL_FROM');

export interface SendResortEmailRequest extends EmailTemplatePayload {
  bookingId?: string;
  idempotencyKey?: string;
}

function computeBackoffMs(retryCount: number): number {
  return 5 * 60 * 1000 * Math.pow(3, retryCount);
}

interface ProviderDeliveryResult {
  ok: boolean;
  provider: 'resend' | 'smtp';
  messageId?: string;
  retryable: boolean;
  errorMessage?: string;
}

async function deliverViaConfiguredProvider(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<ProviderDeliveryResult> {
  const resendKey = RESEND_API_KEY.value().trim();
  const smtpHost = SMTP_HOST.value().trim();
  const smtpPort = Number(SMTP_PORT.value().trim() || '587');
  const smtpUser = SMTP_USER.value().trim();
  const smtpPass = SMTP_PASS.value().trim();
  const fromAddress =
    EMAIL_FROM.value().trim() ||
    smtpUser ||
    'Mykonos Cottage Tarkarli <reservations@mykonostarkarli.in>';

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });
      const json = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
      };
      if (response.ok && json.id) {
        return {
          ok: true,
          provider: 'resend',
          messageId: json.id,
          retryable: false,
        };
      }
      return {
        ok: false,
        provider: 'resend',
        retryable: response.status === 429 || response.status >= 500,
        errorMessage: json.message || `Resend returned HTTP ${response.status}`,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'resend',
        retryable: true,
        errorMessage: err instanceof Error ? err.message : 'Resend network error',
      };
    }
  }

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return {
        ok: true,
        provider: 'smtp',
        messageId: info.messageId,
        retryable: false,
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'smtp',
        retryable: true,
        errorMessage: err instanceof Error ? err.message : 'SMTP delivery failed',
      };
    }
  }

  throw new HttpsError(
    'failed-precondition',
    'Email provider secrets (RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS) are not configured in Firebase Functions Secrets.'
  );
}

export async function dispatchEmailInternal(
  payload: SendResortEmailRequest,
  dispatchedByUid: string
): Promise<{
  logId: string;
  status: 'sent' | 'failed';
  provider: string;
  messageId?: string;
  duplicatePrevented?: boolean;
  errorMessage?: string;
}> {
  const toEmail = String(payload.guestEmail || '').trim();
  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    throw new HttpsError('invalid-argument', 'A valid guest email address is required.');
  }

  // Ensure secrets exist before creating idempotency lock
  const hasProvider =
    Boolean(RESEND_API_KEY.value().trim()) ||
    Boolean(
      SMTP_HOST.value().trim() &&
        SMTP_USER.value().trim() &&
        SMTP_PASS.value().trim()
    );
  if (!hasProvider) {
    throw new HttpsError(
      'failed-precondition',
      'Email provider secrets (RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS) are not configured on Firebase Functions.'
    );
  }

  const rawKey =
    payload.idempotencyKey ||
    `${payload.templateType}_${toEmail.toLowerCase()}_${
      payload.bookingId || payload.invoiceNumber || new Date().toISOString().slice(0, 13)
    }`;
  const safeKey = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const keyRef = db.collection('emailDispatchKeys').doc(safeKey);

  const lock = await db.runTransaction(async (tx) => {
    const snap = await tx.get(keyRef);
    if (snap.exists) {
      const existing = snap.data() || {};
      if (existing.status === 'sent' || existing.status === 'processing') {
        return {
          alreadyDispatched: true,
          logId: String(existing.logId || ''),
          provider: String(existing.provider || 'smtp'),
          messageId: existing.messageId ? String(existing.messageId) : undefined,
        };
      }
    }
    const logId = `email-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    tx.set(keyRef, {
      status: 'processing',
      logId,
      toEmail,
      templateType: payload.templateType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { alreadyDispatched: false, logId, provider: 'smtp', messageId: undefined };
  });

  if (lock.alreadyDispatched) {
    return {
      logId: lock.logId,
      status: 'sent',
      provider: lock.provider,
      messageId: lock.messageId,
      duplicatePrevented: true,
    };
  }

  const rendered = renderEmailTemplate(payload);
  const delivery = await deliverViaConfiguredProvider({
    to: toEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  const nowIso = new Date().toISOString();
  await db
    .collection('emailLogs')
    .doc(lock.logId)
    .set({
      id: lock.logId,
      templateType: payload.templateType,
      guestName: payload.guestName || 'Guest',
      guestEmail: toEmail,
      bookingId: payload.bookingId || null,
      bookingCode: payload.bookingCode || null,
      invoiceNumber: payload.invoiceNumber || null,
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      provider: delivery.provider,
      messageId: delivery.messageId || null,
      status: delivery.ok ? 'sent' : 'failed',
      errorReason: delivery.errorMessage || null,
      retryable: delivery.retryable,
      retryCount: 0,
      nextRetryAtISO:
        !delivery.ok && delivery.retryable
          ? new Date(Date.now() + computeBackoffMs(0)).toISOString()
          : null,
      createdAtISO: nowIso,
      dispatchedByUid,
      idempotencyKey: safeKey,
    });

  await keyRef.set(
    {
      status: delivery.ok ? 'sent' : 'failed',
      provider: delivery.provider,
      messageId: delivery.messageId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    logId: lock.logId,
    status: delivery.ok ? 'sent' : 'failed',
    provider: delivery.provider,
    messageId: delivery.messageId,
    errorMessage: delivery.errorMessage,
  };
}

export const sendResortEmail = onCall<SendResortEmailRequest>(
  {
    region: 'asia-south1',
    secrets: [
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      RESEND_API_KEY,
      EMAIL_FROM,
    ],
  },
  async (request) => {
    const staff = await assertAuthorizedStaff(request);
    return dispatchEmailInternal(request.data, staff.uid);
  }
);

async function processFailedEmailRetries(): Promise<{
  attempted: number;
  succeeded: number;
}> {
  const nowIso = new Date().toISOString();
  const snap = await db
    .collection('emailLogs')
    .where('status', '==', 'failed')
    .where('retryable', '==', true)
    .limit(20)
    .get();

  let attempted = 0;
  let succeeded = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const retryCount = Number(data.retryCount || 0);
    if (retryCount >= 3) continue;
    if (data.nextRetryAtISO && String(data.nextRetryAtISO) > nowIso) continue;

    attempted += 1;
    const delivery = await deliverViaConfiguredProvider({
      to: String(data.guestEmail || ''),
      subject: String(data.subject || 'Mykonos Cottage Reservation Update'),
      html: String(data.htmlBody || ''),
      text: String(data.textBody || ''),
    });

    const nextCount = retryCount + 1;
    await docSnap.ref.set(
      {
        status: delivery.ok ? 'sent' : 'failed',
        messageId: delivery.messageId || data.messageId || null,
        retryCount: nextCount,
        retryable: !delivery.ok && delivery.retryable && nextCount < 3,
        errorReason: delivery.ok ? null : delivery.errorMessage || null,
        nextRetryAtISO:
          !delivery.ok && delivery.retryable && nextCount < 3
            ? new Date(Date.now() + computeBackoffMs(nextCount)).toISOString()
            : null,
        lastRetryAtISO: new Date().toISOString(),
      },
      { merge: true }
    );
    if (delivery.ok) succeeded += 1;
  }

  return { attempted, succeeded };
}

export const retryFailedEmails = onCall(
  {
    region: 'asia-south1',
    secrets: [
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      RESEND_API_KEY,
      EMAIL_FROM,
    ],
  },
  async (request) => {
    await assertAuthorizedStaff(request);
    return processFailedEmailRetries();
  }
);

export const retryFailedEmailsJob = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    secrets: [
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      RESEND_API_KEY,
      EMAIL_FROM,
    ],
  },
  async () => {
    await processFailedEmailRetries();
  }
);
