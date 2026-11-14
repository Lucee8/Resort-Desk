import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();

const ALLOWED_STAFF_ROLES = new Set([
  'admin',
  'resort owner',
  'owner',
  'manager',
  'general manager',
  'front desk',
  'receptionist',
  'staff',
  'operations',
]);

/**
 * Verifies that the caller is an authenticated Firebase user with an authorized
 * Mykonos Cottage staff or admin profile.
 */
export async function assertAuthorizedStaff(
  request: CallableRequest<unknown>
): Promise<{ uid: string; email: string; role: string }> {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError(
      'unauthenticated',
      'Staff authentication is required to dispatch guest communications.'
    );
  }

  const uid = request.auth.uid;
  const email = (request.auth.token.email as string | undefined) || '';

  // 1. Check dedicated admins collection
  const adminDoc = await db.collection('admins').doc(uid).get();
  if (adminDoc.exists) {
    return { uid, email, role: 'admin' };
  }

  // 2. Check staffProfiles/{uid}
  const profileDoc = await db.collection('staffProfiles').doc(uid).get();
  if (profileDoc.exists) {
    const profile = profileDoc.data() || {};
    const role = String(profile.role || 'staff').toLowerCase();
    if (profile.disabled === true) {
      throw new HttpsError('permission-denied', 'Your staff account is disabled.');
    }
    if (ALLOWED_STAFF_ROLES.has(role)) {
      return { uid, email, role };
    }
  }

  // 3. Fallback: check active staffMembers by verified email
  if (email) {
    const staffSnap = await db
      .collection('staffMembers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!staffSnap.empty) {
      const staffData = staffSnap.docs[0].data();
      if (staffData.status !== 'Terminated') {
        return { uid, email, role: String(staffData.role || 'staff').toLowerCase() };
      }
    }
  }

  throw new HttpsError(
    'permission-denied',
    'Authenticated user is not registered as authorized Mykonos Cottage staff.'
  );
}

/**
 * Normalizes Indian phone numbers to WhatsApp E.164 digits without '+' (e.g. 919820012345).
 */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
}

export function getTodayKolkataISO(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}
