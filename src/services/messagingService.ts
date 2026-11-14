import {
  functions,
  httpsCallable,
  db,
  collection,
  query,
  onSnapshot,
} from '../firebase';
import { EmailLogItem } from '../types';

export type WhatsAppCloudMessageType =
  | 'booking_confirmation'
  | 'booking_voucher'
  | 'payment_confirmation'
  | 'checkin_reminder'
  | 'checkout_reminder'
  | 'payment_reminder'
  | 'review_request'
  | 'custom_template';

export type EmailCloudTemplateType =
  | 'booking_confirmation'
  | 'booking_voucher'
  | 'gst_invoice'
  | 'payment_receipt'
  | 'booking_cancellation'
  | 'checkin_info'
  | 'checkout_info';

export interface CloudDispatchResponse {
  ok: boolean;
  logId?: string;
  status: 'sent' | 'failed' | 'needs-deployment' | 'needs-credentials' | 'error';
  wamid?: string;
  messageId?: string;
  duplicatePrevented?: boolean;
  message: string;
}

function classifyCallableError(
  err: unknown,
  channel: 'WhatsApp Cloud API' | 'Email Service'
): CloudDispatchResponse {
  const anyErr = err as { code?: string; message?: string };
  const code = String(anyErr?.code || '').toLowerCase();
  const msg = String(anyErr?.message || `${channel} dispatch failed.`);

  if (code.includes('failed-precondition')) {
    return {
      ok: false,
      status: 'needs-credentials',
      message: msg,
    };
  }
  if (
    code.includes('not-found') ||
    code.includes('unavailable') ||
    code.includes('internal') ||
    msg.toLowerCase().includes('cors') ||
    msg.toLowerCase().includes('failed to fetch')
  ) {
    return {
      ok: false,
      status: 'needs-deployment',
      message: `${channel} Cloud Function in asia-south1 is not deployed yet or unreachable. Deploy functions and configure Firebase Secrets to enable live server dispatch.`,
    };
  }
  return {
    ok: false,
    status: 'error',
    message: msg,
  };
}

export async function sendWhatsAppViaCloudAPI(payload: {
  messageType: WhatsAppCloudMessageType;
  guestName: string;
  guestPhone: string;
  roomNumber?: string;
  bookingId?: string;
  bookingCode?: string;
  invoiceNumber?: string;
  templateName?: string;
  templateParams?: string[];
  fallbackText?: string;
  idempotencyKey?: string;
  workflowName?: string;
  nodeTitle?: string;
}): Promise<CloudDispatchResponse> {
  try {
    const callable = httpsCallable<typeof payload, {
      logId: string;
      status: 'sent' | 'failed';
      wamid?: string;
      duplicatePrevented?: boolean;
      errorMessage?: string;
    }>(functions, 'sendWhatsAppMessage');

    const res = await callable(payload);
    const data = res.data;

    if (data.status === 'sent') {
      return {
        ok: true,
        status: 'sent',
        logId: data.logId,
        wamid: data.wamid,
        duplicatePrevented: data.duplicatePrevented,
        message: data.duplicatePrevented
          ? `Duplicate prevented — existing WhatsApp dispatch (${data.wamid || data.logId}) already sent.`
          : `WhatsApp message dispatched via Meta Cloud API (${data.wamid || data.logId}).`,
      };
    }

    return {
      ok: false,
      status: 'failed',
      logId: data.logId,
      message: data.errorMessage || 'Meta WhatsApp Cloud API rejected the template message.',
    };
  } catch (err) {
    return classifyCallableError(err, 'WhatsApp Cloud API');
  }
}

export async function retryFailedWhatsAppViaCloud(): Promise<{
  ok: boolean;
  attempted: number;
  succeeded: number;
  message: string;
}> {
  try {
    const callable = httpsCallable<Record<string, never>, { attempted: number; succeeded: number }>(
      functions,
      'retryFailedWhatsApp'
    );
    const res = await callable({});
    return {
      ok: true,
      attempted: res.data.attempted,
      succeeded: res.data.succeeded,
      message: `Retried ${res.data.attempted} failed WhatsApp message(s); ${res.data.succeeded} succeeded.`,
    };
  } catch (err) {
    const classified = classifyCallableError(err, 'WhatsApp Cloud API');
    return {
      ok: false,
      attempted: 0,
      succeeded: 0,
      message: classified.message,
    };
  }
}

export async function sendEmailViaCloudFunction(payload: {
  templateType: EmailCloudTemplateType;
  guestName: string;
  guestEmail: string;
  bookingId?: string;
  bookingCode?: string;
  folioNumber?: string;
  invoiceNumber?: string;
  roomNumber?: string;
  roomCategory?: string;
  checkInDate?: string;
  checkOutDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  nights?: number;
  totalAmount?: number;
  advancePaid?: number;
  balanceDue?: number;
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  receiptNumber?: string;
  gstRate?: number;
  sacCode?: string;
  taxableSubtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  refundAmount?: number;
  cancellationReason?: string;
  idempotencyKey?: string;
}): Promise<CloudDispatchResponse> {
  try {
    const callable = httpsCallable<typeof payload, {
      logId: string;
      status: 'sent' | 'failed';
      provider: string;
      messageId?: string;
      duplicatePrevented?: boolean;
      errorMessage?: string;
    }>(functions, 'sendResortEmail');

    const res = await callable(payload);
    const data = res.data;

    if (data.status === 'sent') {
      return {
        ok: true,
        status: 'sent',
        logId: data.logId,
        messageId: data.messageId,
        duplicatePrevented: data.duplicatePrevented,
        message: data.duplicatePrevented
          ? `Duplicate prevented — email already dispatched (${data.messageId || data.logId}).`
          : `Email sent via ${data.provider} (${data.messageId || data.logId}).`,
      };
    }

    return {
      ok: false,
      status: 'failed',
      logId: data.logId,
      message: data.errorMessage || 'Email provider failed to deliver.',
    };
  } catch (err) {
    return classifyCallableError(err, 'Email Service');
  }
}

export async function retryFailedEmailsViaCloud(): Promise<{
  ok: boolean;
  attempted: number;
  succeeded: number;
  message: string;
}> {
  try {
    const callable = httpsCallable<Record<string, never>, { attempted: number; succeeded: number }>(
      functions,
      'retryFailedEmails'
    );
    const res = await callable({});
    return {
      ok: true,
      attempted: res.data.attempted,
      succeeded: res.data.succeeded,
      message: `Retried ${res.data.attempted} failed email(s); ${res.data.succeeded} succeeded.`,
    };
  } catch (err) {
    const classified = classifyCallableError(err, 'Email Service');
    return {
      ok: false,
      attempted: 0,
      succeeded: 0,
      message: classified.message,
    };
  }
}

export function subscribeEmailLogs(
  onData: (logs: EmailLogItem[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    query(collection(db, 'emailLogs')),
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ ...(d.data() as EmailLogItem), id: d.id }))
        .sort((a, b) => (b.createdAtISO || '').localeCompare(a.createdAtISO || ''));
      onData(rows);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}
