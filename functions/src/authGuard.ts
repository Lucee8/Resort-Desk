import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();

const ALLOWED_STAFF_ROLES = new Set([
  'administrator',
  'admin',
  'resort owner',
  'owner',
  'super admin',
  'general manager',
  'manager',
  'receptionist',
  'front desk',
  'front desk associate',
  'housekeeping staff',
  'housekeeping',
  'housekeeper',
  'steward',
  'maintenance staff',
  'maintenance',
  'technician',
  'accountant',
  'finance',
  'inventory manager',
  'storekeeper',
  'inventory',
  'staff',
  'operations',
]);

const ADMINISTRATOR_ROLES = new Set([
  'administrator',
  'admin',
  'resort owner',
  'owner',
  'super admin',
]);

const BOOTSTRAPPED_ADMIN_UIDS = new Set([
  'hHUxZag1vXW1NnxYwe34iHodPqf2',
]);

/**
 * Verifies that the caller is an authenticated Firebase user with an active
 * Mykonos Cottage staff or admin profile.
 */
export async function assertAuthorizedStaff(
  request: CallableRequest<unknown>
): Promise<{ uid: string; email: string; role: string }> {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError(
      'unauthenticated',
      'Staff authentication is required to perform this action.'
    );
  }

  const uid = request.auth.uid;
  const email = (request.auth.token.email as string | undefined) || '';

  // 1. Check primary RBAC staff/{uid} collection
  const staffDoc = await db.collection('staff').doc(uid).get();
  if (staffDoc.exists) {
    const data = staffDoc.data() || {};
    if (data.isActive === false || data.disabled === true) {
      throw new HttpsError(
        'permission-denied',
        'Your staff account has been deactivated. Contact an Administrator.'
      );
    }
    const role = String(data.role || '').trim().toLowerCase();
    if (ALLOWED_STAFF_ROLES.has(role)) {
      return { uid, email: String(data.email || email), role };
    }
    throw new HttpsError(
      'permission-denied',
      'Your staff account does not have an authorized Mykonos Cottage role.'
    );
  }

  // 2. Check legacy dedicated admins collection or bootstrapped initial admin UID
  if (BOOTSTRAPPED_ADMIN_UIDS.has(uid)) {
    return { uid, email, role: 'administrator' };
  }

  const adminDoc = await db.collection('admins').doc(uid).get();
  if (adminDoc.exists) {
    return { uid, email, role: 'administrator' };
  }

  // 3. Check legacy staffProfiles/{uid}
  const profileDoc = await db.collection('staffProfiles').doc(uid).get();
  if (profileDoc.exists) {
    const profile = profileDoc.data() || {};
    const role = String(profile.role || 'staff').trim().toLowerCase();
    if (profile.disabled === true || profile.isActive === false) {
      throw new HttpsError('permission-denied', 'Your staff account is disabled.');
    }
    if (ALLOWED_STAFF_ROLES.has(role)) {
      return { uid, email, role };
    }
  }

  // 4. Fallback: check active staffMembers by verified email
  if (email && request.auth.token.email_verified === true) {
    const staffSnap = await db
      .collection('staffMembers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!staffSnap.empty) {
      const staffData = staffSnap.docs[0].data();
      if (staffData.status !== 'Terminated') {
        const role = String(staffData.role || 'staff').trim().toLowerCase();
        if (ALLOWED_STAFF_ROLES.has(role)) {
          return { uid, email, role };
        }
      }
    }
  }

  throw new HttpsError(
    'permission-denied',
    'Authenticated user is not registered as authorized Mykonos Cottage staff.'
  );
}

/**
 * Verifies that the caller is an active Administrator allowed to manage staff accounts & RBAC.
 */
export async function assertAdministrator(
  request: CallableRequest<unknown>
): Promise<{ uid: string; email: string }> {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Administrator authentication is required.');
  }

  const uid = request.auth.uid;
  const email = (request.auth.token.email as string | undefined) || '';

  const staffDoc = await db.collection('staff').doc(uid).get();
  if (staffDoc.exists) {
    const data = staffDoc.data() || {};
    const role = String(data.role || '').trim().toLowerCase();
    if (data.isActive === false || data.disabled === true) {
      throw new HttpsError('permission-denied', 'Your administrator account is deactivated.');
    }
    if (ADMINISTRATOR_ROLES.has(role)) {
      return { uid, email: String(data.email || email) };
    }
    throw new HttpsError(
      'permission-denied',
      'Only an active Administrator can manage staff login accounts and permissions.'
    );
  }

  if (BOOTSTRAPPED_ADMIN_UIDS.has(uid)) {
    return { uid, email };
  }

  const adminDoc = await db.collection('admins').doc(uid).get();
  if (adminDoc.exists) {
    return { uid, email };
  }

  const profileDoc = await db.collection('staffProfiles').doc(uid).get();
  if (profileDoc.exists) {
    const profile = profileDoc.data() || {};
    const role = String(profile.role || '').trim().toLowerCase();
    if (profile.disabled !== true && profile.isActive !== false && ADMINISTRATOR_ROLES.has(role)) {
      return { uid, email };
    }
  }

  throw new HttpsError(
    'permission-denied',
    'Only an active Administrator can manage staff login accounts and permissions.'
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
