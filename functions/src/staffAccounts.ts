import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { assertAdministrator, db } from './authGuard';

const VALID_ROLES = new Set([
  'Administrator',
  'General Manager',
  'Receptionist',
  'Housekeeping Staff',
  'Maintenance Staff',
  'Accountant',
  'Inventory Manager',
]);

const ROLE_DEFAULT_DEPARTMENT: Record<string, string> = {
  Administrator: 'Management',
  'General Manager': 'Management',
  Receptionist: 'Front Desk',
  'Housekeeping Staff': 'Housekeeping',
  'Maintenance Staff': 'Maintenance',
  Accountant: 'Management',
  'Inventory Manager': 'Management',
};

const VALID_PERMISSIONS = new Set([
  'view_dashboard',
  'manage_bookings',
  'checkin_checkout',
  'view_guests',
  'manage_guests',
  'view_billing',
  'manage_billing',
  'process_refunds',
  'view_rooms',
  'manage_rooms',
  'update_room_status',
  'view_housekeeping',
  'manage_housekeeping',
  'update_housekeeping_tasks',
  'view_maintenance',
  'manage_maintenance',
  'update_maintenance_tickets',
  'view_inventory',
  'manage_inventory',
  'manage_purchase_orders',
  'manage_whatsapp',
  'manage_reviews',
  'view_reports',
  'export_reports',
  'view_staff',
  'manage_staff_hr',
  'manage_staff_accounts',
  'manage_roles',
  'manage_settings',
  'delete_records',
  'seed_data',
]);

interface CreateStaffAccountInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
}

interface UpdateStaffAccountInput {
  uid: string;
  fullName: string;
  phone?: string;
  role: string;
  department?: string;
  permissions?: string[];
  isActive: boolean;
}

function sanitizePermissions(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];
  return Array.from(
    new Set(
      permissions
        .map((p) => String(p || '').trim())
        .filter((p) => VALID_PERMISSIONS.has(p))
    )
  );
}

export const createStaffAccount = onCall<CreateStaffAccountInput>(
  { region: 'asia-south1' },
  async (request) => {
    const adminCaller = await assertAdministrator(request);
    const data = request.data || ({} as CreateStaffAccountInput);

    const fullName = String(data.fullName || '').trim().slice(0, 120);
    const email = String(data.email || '').trim().toLowerCase().slice(0, 180);
    const phone = String(data.phone || '').trim().slice(0, 40);
    const password = String(data.password || '');
    const role = String(data.role || '').trim();
    const isActive = data.isActive !== false;
    const department =
      String(data.department || '').trim().slice(0, 80) ||
      ROLE_DEFAULT_DEPARTMENT[role] ||
      'Management';
    const permissions = sanitizePermissions(data.permissions);

    if (!fullName || fullName.length < 2) {
      throw new HttpsError('invalid-argument', 'Staff full name must be at least 2 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError('invalid-argument', 'A valid staff email address is required.');
    }
    if (!password || password.length < 8) {
      throw new HttpsError('invalid-argument', 'Temporary password must be at least 8 characters.');
    }
    if (!VALID_ROLES.has(role)) {
      throw new HttpsError('invalid-argument', 'Invalid Mykonos Cottage staff role selected.');
    }

    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
        disabled: !isActive,
        emailVerified: true,
      });
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code || '')
          : '';
      if (code === 'auth/email-already-exists') {
        throw new HttpsError(
          'already-exists',
          'A Firebase Auth user already exists with this email address.'
        );
      }
      throw new HttpsError(
        'internal',
        err instanceof Error ? err.message : 'Unable to create Firebase Auth staff account.'
      );
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role,
      permissions,
      isActive,
    });

    const nowISO = new Date().toISOString();
    const staffRecord = {
      uid: userRecord.uid,
      fullName,
      email,
      phone,
      role,
      permissions,
      department,
      isActive,
      createdAt: nowISO,
      updatedAt: nowISO,
      createdByUid: adminCaller.uid,
    };

    const batch = db.batch();
    batch.set(db.collection('staff').doc(userRecord.uid), staffRecord);
    batch.set(
      db.collection('staffProfiles').doc(userRecord.uid),
      {
        uid: userRecord.uid,
        email,
        displayName: fullName,
        role,
        department,
        disabled: !isActive,
        isActive,
        updatedAt: nowISO,
      },
      { merge: true }
    );
    await batch.commit();

    return { account: staffRecord };
  }
);

export const updateStaffAccount = onCall<UpdateStaffAccountInput>(
  { region: 'asia-south1' },
  async (request) => {
    const adminCaller = await assertAdministrator(request);
    const data = request.data || ({} as UpdateStaffAccountInput);

    const uid = String(data.uid || '').trim();
    const fullName = String(data.fullName || '').trim().slice(0, 120);
    const phone = String(data.phone || '').trim().slice(0, 40);
    const role = String(data.role || '').trim();
    const isActive = data.isActive !== false;
    const department =
      String(data.department || '').trim().slice(0, 80) ||
      ROLE_DEFAULT_DEPARTMENT[role] ||
      'Management';
    const permissions = sanitizePermissions(data.permissions);

    if (!uid || !/^[a-zA-Z0-9_.-]{1,128}$/.test(uid)) {
      throw new HttpsError('invalid-argument', 'A valid staff UID is required.');
    }
    if (!fullName || fullName.length < 2) {
      throw new HttpsError('invalid-argument', 'Staff full name must be at least 2 characters.');
    }
    if (!VALID_ROLES.has(role)) {
      throw new HttpsError('invalid-argument', 'Invalid staff role selected.');
    }
    if (uid === adminCaller.uid && (!isActive || role !== 'Administrator')) {
      throw new HttpsError(
        'failed-precondition',
        'You cannot deactivate or remove Administrator privileges from your own account.'
      );
    }

    await admin.auth().updateUser(uid, {
      displayName: fullName,
      disabled: !isActive,
    });

    await admin.auth().setCustomUserClaims(uid, {
      role,
      permissions,
      isActive,
    });

    const nowISO = new Date().toISOString();
    const batch = db.batch();
    batch.set(
      db.collection('staff').doc(uid),
      {
        uid,
        fullName,
        phone,
        role,
        department,
        permissions,
        isActive,
        updatedAt: nowISO,
      },
      { merge: true }
    );
    batch.set(
      db.collection('staffProfiles').doc(uid),
      {
        uid,
        displayName: fullName,
        role,
        department,
        disabled: !isActive,
        isActive,
        updatedAt: nowISO,
      },
      { merge: true }
    );
    await batch.commit();

    return { ok: true };
  }
);

export const sendStaffPasswordReset = onCall<{ email: string }>(
  { region: 'asia-south1' },
  async (request) => {
    await assertAdministrator(request);
    const email = String(request.data?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError('invalid-argument', 'A valid staff email address is required.');
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email);
    return { ok: true, resetLink };
  }
);
