import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

/**
 * Firebase Web Client Configuration for resortdesk-mykonos
 * Reads environment variables configured via Vite (VITE_FIREBASE_*)
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resortdesk-mykonos.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resortdesk-mykonos',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resortdesk-mykonos.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '161756443258',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:161756443258:web:28ea297095f0d00fea01c3',
};

/**
 * Checks whether the Firebase Web API Key is populated.
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY');
};

/**
 * Initialize Firebase singleton app instance.
 * Avoids duplicate app re-initialization in fast-refresh and dev cycles.
 */
export const app: FirebaseApp = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export default app;
