import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  onIdTokenChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
  Auth,
  UserCredential,
} from 'firebase/auth';
import app, { firebaseInitError, isFirebaseConfigured } from './config';

let authInstance: Auth | null = null;
let authInitError: string | null = firebaseInitError;

if (app && isFirebaseConfigured()) {
  try {
    authInstance = getAuth(app);
  } catch (err) {
    authInitError =
      err instanceof Error
        ? err.message
        : 'Firebase Authentication failed to initialize.';
    authInstance = null;
    console.error('[ResortDesk Firebase Auth Error]', authInitError);
  }
}

/**
 * Firebase Authentication instance (null when Firebase config is missing/invalid)
 */
export const auth: Auth | null = authInstance;
export { authInitError };

function assertAuthReady(): Auth {
  if (!auth) {
    throw new Error(
      authInitError ||
        'Firebase Authentication is not configured. Ensure VITE_FIREBASE_API_KEY and related VITE_FIREBASE_* variables are set before building.'
    );
  }
  return auth;
}

/**
 * Maps Firebase Auth error codes to user-friendly hospitality staff messages
 */
export function mapFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : String(error || '');

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please verify your staff credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid staff email address.';
    case 'auth/user-disabled':
      return 'Your staff account has been deactivated. Contact the Resort Administrator.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please wait a few minutes or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection unavailable. Check your internet access and try again.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    default:
      if (message.includes('auth/invalid-credential')) {
        return 'Incorrect email or password. Please verify your staff credentials and try again.';
      }
      return message || 'Authentication failed. Please try again.';
  }
}

/**
 * Sign in an existing staff user with email, password, and persistence preference
 */
export const signInWithEmail = async (
  email: string,
  pass: string,
  rememberMe = true
): Promise<UserCredential> => {
  const readyAuth = assertAuthReady();
  await setPersistence(
    readyAuth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
  return signInWithEmailAndPassword(readyAuth, email.trim(), pass);
};

/**
 * Sign out the currently authenticated user
 */
export const logOut = async (): Promise<void> => {
  return firebaseSignOut(assertAuthReady());
};

/**
 * Send a password reset email via Firebase Auth
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(assertAuthReady(), email.trim());
};

/**
 * Subscribe to authentication state changes safely even when Firebase is unconfigured
 */
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  if (!auth) {
    queueMicrotask(() => callback(null));
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Re-export modular Firebase Auth methods and types for direct usage
export {
  signInWithEmailAndPassword,
  firebaseSignOut as signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  onIdTokenChanged,
};
export type { User, UserCredential, Auth };

export default auth;
