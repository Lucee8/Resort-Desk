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
  UserCredential
} from 'firebase/auth';
import app from './config';

/**
 * Firebase Authentication instance
 */
export const auth: Auth = getAuth(app);

/**
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (
  email: string, 
  pass: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email.trim(), pass);
};

/**
 * Create a new user with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  pass: string, 
  displayName?: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
};

/**
 * Sign out the currently authenticated user
 */
export const logOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

/**
 * Send a password reset email
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email.trim());
};

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

// Re-export modular Firebase Auth methods and types for direct usage
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut as signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
};
export type { User, UserCredential, Auth };

export default auth;
