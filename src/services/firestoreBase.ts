import {
  auth,
  db,
  storage,
  functions,
  doc,
  getDocFromServer,
  firebaseInitError,
  isFirebaseConfigured,
  Firestore,
  FirebaseStorage,
  Functions,
} from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function requireDb(): Firestore {
  if (!db) {
    throw new Error(
      firebaseInitError ||
        'Cloud Firestore is not configured. Ensure VITE_FIREBASE_* environment variables are set before building.'
    );
  }
  return db;
}

export function requireStorage(): FirebaseStorage {
  if (!storage) {
    throw new Error(
      firebaseInitError ||
        'Firebase Storage is not configured. Ensure VITE_FIREBASE_* environment variables are set before building.'
    );
  }
  return storage;
}

export function requireFunctions(): Functions | null {
  return functions;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser ?? null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}

/**
 * Recursively strips `undefined` values so Firestore setDoc/updateDoc/transactions
 * never throw "Unsupported field value: undefined".
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        out[k] = stripUndefined(v);
      }
    }
    return out as T;
  }
  return value;
}

export type FirestoreConnectionStatus =
  | 'checking'
  | 'connected'
  | 'permission-denied'
  | 'offline'
  | 'unconfigured'
  | 'error';

export async function testFirestoreConnection(): Promise<{
  status: FirestoreConnectionStatus;
  message?: string;
}> {
  if (!isFirebaseConfigured() || !db) {
    return {
      status: 'unconfigured',
      message:
        firebaseInitError ||
        'Firebase configuration is incomplete. Check VITE_FIREBASE_* build environment variables.',
    };
  }
  try {
    await getDocFromServer(doc(db, '_health', 'connection'));
    return { status: 'connected' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
      return { status: 'permission-denied', message: msg };
    }
    if (msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('network')) {
      return { status: 'offline', message: msg };
    }
    return { status: 'error', message: msg };
  }
}
