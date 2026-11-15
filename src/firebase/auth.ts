import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
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
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (
  email: string,
  pass: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(assertAuthReady(), email.trim(), pass);
};

/**
 * Create a new user with email and password
 */
export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(
    assertAuthReady(),
    email.trim(),
    pass
  );
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
};

/**
 * Sign out the currently authenticated user
 */
export const logOut = async (): Promise<void> => {
  return firebaseSignOut(assertAuthReady());
};

/**
 * Send a password reset email
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
  createUserWithEmailAndPassword,
  firebaseSignOut as signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
};
export type { User, UserCredential, Auth };

export default auth;
