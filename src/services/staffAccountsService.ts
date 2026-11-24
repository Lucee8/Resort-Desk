import { deleteApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import {
  auth,
  db,
  firebaseConfig,
  functions,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  resetUserPassword,
} from '../firebase';
import { PermissionAction, StaffAccountProfile, StaffAccountRole } from '../types';
import {
  getEffectivePermissions,
  normalizeStaffRole,
  ROLE_DEFINITIONS,
} from '../config/permissions';
import {
  OperationType,
  handleFirestoreError,
  requireDb,
  stripUndefined,
} from './firestoreBase';

export interface CreateStaffAccountPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: StaffAccountRole;
  department: string;
  permissions?: PermissionAction[];
  isActive: boolean;
}

export interface UpdateStaffAccountPayload {
  uid: string;
  fullName: string;
  phone: string;
  role: StaffAccountRole;
  department: string;
  permissions: PermissionAction[];
  isActive: boolean;
}

function normalizeStaffDoc(id: string, raw: Record<string, unknown>): StaffAccountProfile {
  const role = normalizeStaffRole(raw.role) || 'Receptionist';
  return {
    uid: String(raw.uid || id),
    fullName: String(raw.fullName || raw.displayName || 'Staff Member'),
    email: String(raw.email || ''),
    phone: String(raw.phone || ''),
    role,
    permissions: getEffectivePermissions(
      role,
      Array.isArray(raw.permissions) ? (raw.permissions as string[]) : undefined
    ),
    department: String(raw.department || ROLE_DEFINITIONS[role].department),
    isActive: raw.isActive !== false && raw.disabled !== true,
    profileImage: typeof raw.profileImage === 'string' ? raw.profileImage : undefined,
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
    createdByUid: typeof raw.createdByUid === 'string' ? raw.createdByUid : undefined,
  };
}

export function subscribeStaffAccounts(
  onData: (accounts: StaffAccountProfile[]) => void,
  onError?: (err: Error) => void
) {
  if (!db) {
    onData([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, 'staff')),
    (snap) => {
      const items = snap.docs
        .map((d) => normalizeStaffDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

function shouldFallbackToClientProvisioning(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    code.includes('not-found') ||
    code.includes('unavailable') ||
    code.includes('internal') ||
    msg.includes('failed to fetch') ||
    msg.includes('cors') ||
    msg.includes('network')
  );
}

export async function createStaffAccountRecord(
  payload: CreateStaffAccountPayload
): Promise<StaffAccountProfile> {
  const resolvedPermissions = getEffectivePermissions(payload.role, payload.permissions);
  const nowISO = new Date().toISOString();

  // 1. Prefer Cloud Function (uses Firebase Admin SDK to create Auth user + set custom claims)
  if (functions) {
    try {
      const callable = httpsCallable<
        CreateStaffAccountPayload & { permissions: PermissionAction[] },
        { account: StaffAccountProfile }
      >(functions, 'createStaffAccount');
      const result = await callable({
        ...payload,
        email: payload.email.trim().toLowerCase(),
        permissions: resolvedPermissions,
      });
      if (result.data?.account) {
        return result.data.account;
      }
    } catch (err) {
      if (!shouldFallbackToClientProvisioning(err)) {
        throw err;
      }
    }
  }

  // 2. Verified Administrator Fallback using an isolated secondary Firebase App
  //    so the currently logged-in Administrator session is never interrupted.
  const firestore = requireDb();
  const secondaryAppName = `staff-provisioner-${Date.now()}`;
  const existing = getApps().find((a) => a.name === secondaryAppName);
  const secondaryApp = existing || initializeApp(firebaseConfig, secondaryAppName);

  try {
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      payload.email.trim().toLowerCase(),
      payload.password
    );
    if (payload.fullName.trim()) {
      await updateProfile(cred.user, { displayName: payload.fullName.trim() });
    }
    const uid = cred.user.uid;
    await firebaseSignOut(secondaryAuth);

    const record: StaffAccountProfile = {
      uid,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role,
      permissions: resolvedPermissions,
      department: payload.department || ROLE_DEFINITIONS[payload.role].department,
      isActive: payload.isActive,
      createdAt: nowISO,
      updatedAt: nowISO,
      createdByUid: auth?.currentUser?.uid,
    };

    try {
      await setDoc(doc(firestore, 'staff', uid), stripUndefined(record));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `staff/${uid}`);
    }

    return record;
  } finally {
    await deleteApp(secondaryApp).catch(() => {});
  }
}

export async function updateStaffAccountRecord(
  payload: UpdateStaffAccountPayload
): Promise<void> {
  const resolvedPermissions = getEffectivePermissions(payload.role, payload.permissions);
  const nowISO = new Date().toISOString();

  if (functions) {
    try {
      const callable = httpsCallable<
        UpdateStaffAccountPayload & { permissions: PermissionAction[] },
        { ok: boolean }
      >(functions, 'updateStaffAccount');
      await callable({
        ...payload,
        permissions: resolvedPermissions,
      });
      return;
    } catch (err) {
      if (!shouldFallbackToClientProvisioning(err)) {
        throw err;
      }
    }
  }

  const firestore = requireDb();
  try {
    await setDoc(
      doc(firestore, 'staff', payload.uid),
      stripUndefined({
        uid: payload.uid,
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        role: payload.role,
        department: payload.department || ROLE_DEFINITIONS[payload.role].department,
        permissions: resolvedPermissions,
        isActive: payload.isActive,
        updatedAt: nowISO,
      }),
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `staff/${payload.uid}`);
  }
}

export async function sendStaffAccountPasswordReset(email: string): Promise<void> {
  await resetUserPassword(email.trim());
}
