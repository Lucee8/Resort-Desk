import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { assertAuthorizedStaff, db, normalizeWhatsAppPhone } from './authGuard';

export const WHATSAPP_ACCESS_TOKEN = defineSecret('WHATSAPP_ACCESS_TOKEN');
export const WHATSAPP_PHONE_NUMBER_ID = defineSecret('WHATSAPP_PHONE_NUMBER_ID');
export const WHATSAPP_VERIFY_TOKEN = defineSecret('WHATSAPP_VERIFY_TOKEN');
export const WHATSAPP_APP_SECRET = defineSecret('WHATSAPP_APP_SECRET');

export type WhatsAppMessageCategory =
  | 'booking_confirmation'
  | 'booking_voucher'
  | 'payment_confirmation'
  | 'checkin_reminder'
  | 'checkout_reminder'
  | 'payment_reminder'
  | 'review_request'
  | 'custom_template';

export interface SendWhatsAppRequest {
  messageType: WhatsAppMessageCategory;
  guestName: string;
  guestPhone: string;
  roomNumber?: string;
  bookingId?: string;
  bookingCode?: string;
  invoiceNumber?: string;
  templateName?: string;
  languageCode?: string;
  templateParams?: string[];
  fallbackText?: string;
  idempotencyKey?: string;
  workflowName?: string;
  nodeTitle?: string;
}

const DEFAULT_TEMPLATE_MAP: Record<WhatsAppMessageCategory, string> = {
  booking_confirmation: 'mykonos_booking_confirmation',
  booking_voucher: 'mykonos_booking_voucher',
  payment_confirmation: 'mykonos_payment_confirmation',
  checkin_reminder: 'mykonos_checkin_reminder',
  checkout_reminder: 'mykonos_checkout_reminder',
  payment_reminder: 'mykonos_payment_reminder',
  review_request: 'mykonos_review_request',
  custom_template: 'mykonos_general_update',
};

const WORKFLOW_LABELS: Record<WhatsAppMessageCategory, string> = {
  booking_confirmation: 'Reservation Confirmation',
  booking_voucher: 'Stay Voucher Dispatch',
  payment_confirmation: 'Payment Receipt Confirmation',
  checkin_reminder: 'Pre-Arrival Check-In Reminder',
  checkout_reminder: 'Checkout Reminder',
  payment_reminder: 'Outstanding Balance Reminder',
  review_request: 'Post-Stay Google Review Request',
  custom_template: 'Front Desk Template Message',
};

function computeBackoffMs(retryCount: number): number {
  // 5 mins -> 15 mins -> 45 mins
  return 5 * 60 * 1000 * Math.pow(3, retryCount);
}

interface GraphDispatchResult {
  ok: boolean;
  wamid?: string;
  retryable: boolean;
  errorCode?: string;
  errorMessage?: string;
}

async function callMetaGraphMessagesAPI(params: {
  accessToken: string;
  phoneNumberId: string;
  toPhone: string;
  templateName: string;
  languageCode: string;
  bodyParams: string[];
}): Promise<GraphDispatchResult> {
  const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
    params.phoneNumberId
  )}/messages`;

  const components =
    params.bodyParams.length > 0
      ? [
          {
            type: 'body',
            parameters: params.bodyParams.map((text) => ({
              type: 'text',
              text: String(text || '-').slice(0, 1024),
            })),
          },
        ]
      : undefined;

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.toPhone,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode || 'en' },
      ...(components ? { components } : {}),
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number; type?: string };
    };

    if (response.ok && data.messages?.[0]?.id) {
      return {
        ok: true,
        wamid: data.messages[0].id,
        retryable: false,
      };
    }

    const code = String(data.error?.code || response.status);
    const message =
      data.error?.message || `Meta Graph API returned HTTP ${response.status}`;
    const retryable = response.status === 429 || response.status >= 500;

    return {
      ok: false,
      retryable,
      errorCode: code,
      errorMessage: message,
    };
  } catch (err) {
    return {
      ok: false,
      retryable: true,
      errorCode: 'NETWORK_ERROR',
      errorMessage: err instanceof Error ? err.message : 'Network call to Meta failed',
    };
  }
}

export async function dispatchWhatsAppInternal(
  payload: SendWhatsAppRequest,
  dispatchedByUid: string
): Promise<{
  logId: string;
  status: 'sent' | 'failed';
  wamid?: string;
  duplicatePrevented?: boolean;
  errorMessage?: string;
}> {
  const normalizedPhone = normalizeWhatsAppPhone(payload.guestPhone);
  if (!normalizedPhone || normalizedPhone.length < 10) {
    throw new HttpsError('invalid-argument', 'A valid guest WhatsApp phone number is required.');
  }

  const accessToken = WHATSAPP_ACCESS_TOKEN.value().trim();
  const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID.value().trim();

  if (!accessToken || !phoneNumberId) {
    throw new HttpsError(
      'failed-precondition',
      'Meta WhatsApp Cloud API secrets (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID) are not configured on Firebase Functions.'
    );
  }

  const templateName =
    payload.templateName ||
    DEFAULT_TEMPLATE_MAP[payload.messageType] ||
    'mykonos_general_update';
  const languageCode = payload.languageCode || 'en';
  const bodyParams = payload.templateParams || [
    payload.guestName || 'Guest',
    payload.bookingCode || payload.invoiceNumber || 'MYK-RES',
    payload.roomNumber || 'Mykonos Cottage',
  ];

  // Duplicate prevention using deterministic idempotency key
  const rawKey =
    payload.idempotencyKey ||
    `${payload.messageType}_${normalizedPhone}_${
      payload.bookingId || payload.invoiceNumber || new Date().toISOString().slice(0, 13)
    }`;
  const safeKey = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const keyRef = db.collection('whatsappDispatchKeys').doc(safeKey);

  const lockResult = await db.runTransaction(async (tx) => {
    const snap = await tx.get(keyRef);
    if (snap.exists) {
      const existing = snap.data() || {};
      if (existing.status === 'sent' || existing.status === 'processing') {
        return {
          alreadyDispatched: true,
          logId: String(existing.logId || ''),
          wamid: existing.wamid ? String(existing.wamid) : undefined,
        };
      }
    }

    const logId = `wa-cloud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    tx.set(keyRef, {
      status: 'processing',
      logId,
      phone: normalizedPhone,
      templateName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { alreadyDispatched: false, logId, wamid: undefined };
  });

  if (lockResult.alreadyDispatched) {
    return {
      logId: lockResult.logId,
      status: 'sent',
      wamid: lockResult.wamid,
      duplicatePrevented: true,
    };
  }

  const logId = lockResult.logId;
  const result = await callMetaGraphMessagesAPI({
    accessToken,
    phoneNumberId,
    toPhone: normalizedPhone,
    templateName,
    languageCode,
    bodyParams,
  });

  const nowIso = new Date().toISOString();
  const timeLabel = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  });

  const logDoc: Record<string, unknown> = {
    id: logId,
    guestName: payload.guestName || 'Guest',
    guestPhone: normalizedPhone,
    roomNumber: payload.roomNumber || '',
    bookingId: payload.bookingId || null,
    bookingCode: payload.bookingCode || null,
    invoiceNumber: payload.invoiceNumber || null,
    workflowName:
      payload.workflowName ||
      WORKFLOW_LABELS[payload.messageType] ||
      'WhatsApp Cloud Dispatch',
    nodeTitle: payload.nodeTitle || templateName,
    direction: 'outbound',
    messageText:
      payload.fallbackText ||
      `[Template: ${templateName}] ${bodyParams.join(' · ')}`,
    status: result.ok ? 'sent' : 'failed',
    timestamp: timeLabel,
    createdAtISO: nowIso,
    templateUsed: templateName,
    languageCode,
    templateParams: bodyParams,
    messageType: payload.messageType,
    wamid: result.wamid || null,
    errorCode: result.errorCode || null,
    errorReason: result.errorMessage || null,
    retryable: result.retryable,
    retryCount: 0,
    nextRetryAtISO:
      !result.ok && result.retryable
        ? new Date(Date.now() + computeBackoffMs(0)).toISOString()
        : null,
    dispatchedByUid,
    idempotencyKey: safeKey,
  };

  await db.collection('whatsappLogs').doc(logId).set(logDoc, { merge: true });
  await keyRef.set(
    {
      status: result.ok ? 'sent' : 'failed',
      wamid: result.wamid || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    logId,
    status: result.ok ? 'sent' : 'failed',
    wamid: result.wamid,
    errorMessage: result.errorMessage,
  };
}

export const sendWhatsAppMessage = onCall<SendWhatsAppRequest>(
  {
    region: 'asia-south1',
    secrets: [WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID],
  },
  async (request) => {
    const staff = await assertAuthorizedStaff(request);
    return dispatchWhatsAppInternal(request.data, staff.uid);
  }
);

async function processFailedWhatsAppRetries(): Promise<{
  attempted: number;
  succeeded: number;
}> {
  const accessToken = WHATSAPP_ACCESS_TOKEN.value().trim();
  const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID.value().trim();
  if (!accessToken || !phoneNumberId) {
    return { attempted: 0, succeeded: 0 };
  }

  const nowIso = new Date().toISOString();
  const failedSnap = await db
    .collection('whatsappLogs')
    .where('status', '==', 'failed')
    .where('retryable', '==', true)
    .limit(20)
    .get();

  let attempted = 0;
  let succeeded = 0;

  for (const docSnap of failedSnap.docs) {
    const data = docSnap.data();
    const retryCount = Number(data.retryCount || 0);
    if (retryCount >= 3) continue;
    if (data.nextRetryAtISO && String(data.nextRetryAtISO) > nowIso) continue;

    attempted += 1;
    const res = await callMetaGraphMessagesAPI({
      accessToken,
      phoneNumberId,
      toPhone: String(data.guestPhone || ''),
      templateName: String(data.templateUsed || 'mykonos_general_update'),
      languageCode: String(data.languageCode || 'en'),
      bodyParams: Array.isArray(data.templateParams)
        ? data.templateParams.map(String)
        : [],
    });

    const nextCount = retryCount + 1;
    await docSnap.ref.set(
      {
        status: res.ok ? 'sent' : 'failed',
        wamid: res.wamid || data.wamid || null,
        retryCount: nextCount,
        retryable: !res.ok && res.retryable && nextCount < 3,
        errorCode: res.ok ? null : res.errorCode || null,
        errorReason: res.ok ? null : res.errorMessage || null,
        nextRetryAtISO:
          !res.ok && res.retryable && nextCount < 3
            ? new Date(Date.now() + computeBackoffMs(nextCount)).toISOString()
            : null,
        lastRetryAtISO: new Date().toISOString(),
      },
      { merge: true }
    );

    if (res.ok) succeeded += 1;
  }

  return { attempted, succeeded };
}

export const retryFailedWhatsApp = onCall(
  {
    region: 'asia-south1',
    secrets: [WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID],
  },
  async (request) => {
    await assertAuthorizedStaff(request);
    return processFailedWhatsAppRetries();
  }
);

export const retryFailedWhatsAppJob = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    secrets: [WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID],
  },
  async () => {
    await processFailedWhatsAppRetries();
  }
);

function verifyMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const whatsappWebhook = onRequest(
  {
    region: 'asia-south1',
    secrets: [WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET],
  },
  async (req, res) => {
    // 1. Meta Webhook Verification (GET)
    if (req.method === 'GET') {
      const mode = String(req.query['hub.mode'] || '');
      const token = String(req.query['hub.verify_token'] || '');
      const challenge = String(req.query['hub.challenge'] || '');
      const expectedToken = WHATSAPP_VERIFY_TOKEN.value().trim();

      if (
        mode === 'subscribe' &&
        expectedToken &&
        token.length === expectedToken.length &&
        crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))
      ) {
        res.status(200).send(challenge);
        return;
      }
      res.status(403).send('Forbidden');
      return;
    }

    // 2. Incoming WhatsApp Cloud Webhook Events (POST)
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const appSecret = WHATSAPP_APP_SECRET.value().trim();
    const signature = req.header('x-hub-signature-256');
    if (appSecret && !verifyMetaSignature(req.rawBody, signature, appSecret)) {
      res.status(401).send('Invalid signature');
      return;
    }

    const payload = req.body as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
            statuses?: Array<{
              id?: string;
              status?: 'sent' | 'delivered' | 'read' | 'failed';
              timestamp?: string;
              errors?: Array<{ code?: number; title?: string; message?: string }>;
            }>;
            messages?: Array<{
              id?: string;
              from?: string;
              timestamp?: string;
              type?: string;
              text?: { body?: string };
              button?: { text?: string };
              interactive?: { button_reply?: { title?: string } };
            }>;
          };
        }>;
      }>;
    };

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        // A. Delivery Status Callbacks
        for (const st of value.statuses || []) {
          if (!st.id || !st.status) continue;
          const matchingLogs = await db
            .collection('whatsappLogs')
            .where('wamid', '==', st.id)
            .limit(3)
            .get();

          const errInfo = st.errors?.[0];
          for (const logSnap of matchingLogs.docs) {
            await logSnap.ref.set(
              {
                status: st.status,
                deliveryTimestamp: st.timestamp || new Date().toISOString(),
                errorCode: errInfo?.code ? String(errInfo.code) : null,
                errorReason: errInfo?.message || errInfo?.title || null,
                webhookUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          }
        }

        // B. Inbound Guest Replies (deduplicated by wamid)
        const contactName = value.contacts?.[0]?.profile?.name || 'Guest';
        for (const msg of value.messages || []) {
          if (!msg.id || !msg.from) continue;
          const inboundRef = db.collection('whatsappInbound').doc(msg.id);
          const existingInbound = await inboundRef.get();
          if (existingInbound.exists) continue;

          const messageText =
            msg.text?.body ||
            msg.button?.text ||
            msg.interactive?.button_reply?.title ||
            `[${msg.type || 'media'} message]`;

          await inboundRef.set({
            wamid: msg.id,
            from: msg.from,
            contactName,
            messageText,
            rawType: msg.type || 'text',
            receivedAtISO: new Date().toISOString(),
          });

          const logId = `wa-in-${msg.id}`;
          await db
            .collection('whatsappLogs')
            .doc(logId)
            .set({
              id: logId,
              guestName: contactName,
              guestPhone: msg.from,
              workflowName: 'Inbound Guest Message',
              nodeTitle: 'Guest Reply',
              direction: 'inbound',
              messageText,
              status: 'replied',
              timestamp: new Date().toLocaleTimeString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
              }),
              createdAtISO: new Date().toISOString(),
              wamid: msg.id,
            });
        }
      }
    }

    res.status(200).json({ received: true });
  }
);
