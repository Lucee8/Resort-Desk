export {
  default as app,
  firebaseConfig,
  firebaseConfigDiagnostics,
  firebaseInitError,
  isFirebaseConfigured,
} from './config';
export { default as auth, authInitError } from './auth';
export * from './auth';
export { default as db } from './firestore';
export * from './firestore';
export { default as storage } from './storage';
export * from './storage';
export { default as functions } from './functions';
export * from './functions';
