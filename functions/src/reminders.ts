import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, getTodayKolkataISO } from './authGuard';
import {
  dispatchWhatsAppInternal,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
} from './whatsapp';
import {
  dispatchEmailInternal,
  EMAIL_FROM,
  RESEND_API_KEY,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from './email';

/**
 * Scheduled daily at 09:00 IST (Asia/Kolkata) in asia-south1.
 * Dispatches automated check-in reminders, checkout reminders, and
 * outstanding payment reminders using per-day idempotency keys.
 */
export const dispatchDailyStayReminders = onSchedule(
  {
    schedule: '0 9 * * *',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    secrets: [
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      RESEND_API_KEY,
      EMAIL_FROM,
    ],
  },
  async () => {
    const todayISO = getTodayKolkataISO();
    const bookingsSnap = await db.collection('bookings').get();

    const hasWhatsAppCreds = Boolean(
      WHATSAPP_ACCESS_TOKEN.value().trim() && WHATSAPP_PHONE_NUMBER_ID.value().trim()
    );
    const hasEmailCreds = Boolean(
      RESEND_API_KEY.value().trim() ||
        (SMTP_HOST.value().trim() && SMTP_USER.value().trim() && SMTP_PASS.value().trim())
    );

    for (const docSnap of bookingsSnap.docs) {
      const b = docSnap.data();
      const status = String(b.bookingStatus || '');
      if (status === 'Cancelled' || status === 'Checked-out') continue;

      const checkInISO = String(b.checkInDateISO || '');
      const checkOutISO = String(b.checkOutDateISO || '');
      const guestName = String(b.guestName || 'Guest');
      const guestPhone = String(b.guestPhone || '');
      const guestEmail = String(b.guestEmail || '');
      const roomNumber = String(b.roomNumber || 'Cottage');
      const bookingCode = String(b.bookingCode || docSnap.id);
      const balanceDue = Math.max(0, Number(b.balanceDue ?? 0));

      // 1. Check-in reminder for today's Confirmed arrivals
      if (status === 'Confirmed' && checkInISO === todayISO) {
        if (hasWhatsAppCreds && guestPhone) {
          await dispatchWhatsAppInternal(
            {
              messageType: 'checkin_reminder',
              guestName,
              guestPhone,
              roomNumber,
              bookingId: docSnap.id,
              bookingCode,
              templateParams: [guestName, roomNumber, String(b.arrivalTime || '02:00 PM')],
              idempotencyKey: `checkin_reminder_${docSnap.id}_${todayISO}`,
            },
            'system_scheduler'
          ).catch(() => undefined);
        }
        if (hasEmailCreds && guestEmail) {
          await dispatchEmailInternal(
            {
              templateType: 'checkin_info',
              guestName,
              guestEmail,
              bookingId: docSnap.id,
              bookingCode,
              roomNumber,
              roomCategory: String(b.roomCategory || ''),
              checkInDate: String(b.startDate || checkInISO),
              checkOutDate: String(b.endDate || checkOutISO),
              checkInTime: String(b.arrivalTime || '02:00 PM'),
              balanceDue,
              idempotencyKey: `checkin_info_email_${docSnap.id}_${todayISO}`,
            },
            'system_scheduler'
          ).catch(() => undefined);
        }
      }

      // 2. Checkout reminder for today's Checked-in departures
      if (status === 'Checked-in' && checkOutISO === todayISO) {
        if (hasWhatsAppCreds && guestPhone) {
          await dispatchWhatsAppInternal(
            {
              messageType: 'checkout_reminder',
              guestName,
              guestPhone,
              roomNumber,
              bookingId: docSnap.id,
              bookingCode,
              templateParams: [guestName, roomNumber, String(b.checkoutTime || '11:00 AM')],
              idempotencyKey: `checkout_reminder_${docSnap.id}_${todayISO}`,
            },
            'system_scheduler'
          ).catch(() => undefined);
        }
        if (hasEmailCreds && guestEmail) {
          await dispatchEmailInternal(
            {
              templateType: 'checkout_info',
              guestName,
              guestEmail,
              bookingId: docSnap.id,
              bookingCode,
              roomNumber,
              checkOutTime: String(b.checkoutTime || '11:00 AM'),
              totalAmount: Number(b.amount || 0),
              advancePaid: Number(b.advancePaid || 0),
              balanceDue,
              idempotencyKey: `checkout_info_email_${docSnap.id}_${todayISO}`,
            },
            'system_scheduler'
          ).catch(() => undefined);
        }
      }

      // 3. Outstanding payment reminder
      if (
        (status === 'Checked-in' || status === 'Confirmed') &&
        balanceDue > 0 &&
        checkOutISO === todayISO &&
        hasWhatsAppCreds &&
        guestPhone
      ) {
        await dispatchWhatsAppInternal(
          {
            messageType: 'payment_reminder',
            guestName,
            guestPhone,
            roomNumber,
            bookingId: docSnap.id,
            bookingCode,
            templateParams: [guestName, bookingCode, `INR ${balanceDue}`],
            idempotencyKey: `payment_reminder_${docSnap.id}_${todayISO}`,
          },
          'system_scheduler'
        ).catch(() => undefined);
      }
    }
  }
);
