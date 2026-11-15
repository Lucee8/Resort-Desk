import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

function cleanEnvValue(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^["']|["']$/g, '').trim();
}

function isPlaceholderOrEmpty(value: string): boolean {
  if (!value) return true;
  const upper = value.toUpperCase();
  return (
    upper === 'UNDEFINED' ||
    upper === 'NULL' ||
    upper.startsWith('YOUR_') ||
    upper.startsWith('MY_') ||
    upper.startsWith('REPLACE_') ||
    upper.includes('PLACEHOLDER') ||
    /^<.*>$/.test(value)
  );
}

const rawMeasurementId = cleanEnvValue(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

/**
 * Firebase Web Client Configuration for resortdesk-mykonos.
 * Reads VITE_FIREBASE_* variables baked in by Vite at build time.
 * Non-secret project identifiers default to resortdesk-mykonos;
 * VITE_FIREBASE_API_KEY must be supplied in build environment variables.
 */
export const firebaseConfig = {
  apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain:
    cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ||
    'resortdesk-mykonos.firebaseapp.com',
  projectId:
    cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID) ||
    'resortdesk-mykonos',
  storageBucket:
    cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    'resortdesk-mykonos.firebasestorage.app',
  messagingSenderId:
    cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    '161756443258',
  appId:
    cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID) ||
    '1:161756443258:web:28ea297095f0d00fea01c3',
  ...(rawMeasurementId ? { measurementId: rawMeasurementId } : {}),
};

export interface FirebaseConfigDiagnostics {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
  errorMessage: string | null;
}

export function getFirebaseConfigDiagnostics(): FirebaseConfigDiagnostics {
  const missingKeys: string[] = [];
  const invalidKeys: string[] = [];

  if (isPlaceholderOrEmpty(firebaseConfig.apiKey)) {
    missingKeys.push('VITE_FIREBASE_API_KEY');
  } else if (!firebaseConfig.apiKey.startsWith('AIza') || firebaseConfig.apiKey.length < 25) {
    invalidKeys.push('VITE_FIREBASE_API_KEY');
  }

  if (isPlaceholderOrEmpty(firebaseConfig.authDomain)) {
    missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  }
  if (isPlaceholderOrEmpty(firebaseConfig.projectId)) {
    missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  }
  if (isPlaceholderOrEmpty(firebaseConfig.storageBucket)) {
    missingKeys.push('VITE_FIREBASE_STORAGE_BUCKET');
  }
  if (isPlaceholderOrEmpty(firebaseConfig.messagingSenderId)) {
    missingKeys.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  }
  if (isPlaceholderOrEmpty(firebaseConfig.appId)) {
    missingKeys.push('VITE_FIREBASE_APP_ID');
  }

  const isValid = missingKeys.length === 0 && invalidKeys.length === 0;
  let errorMessage: string | null = null;
  if (!isValid) {
    const parts: string[] = [];
    if (missingKeys.length > 0) {
      parts.push(`Missing environment variable(s): ${missingKeys.join(', ')}`);
    }
    if (invalidKeys.length > 0) {
      parts.push(`Invalid format for: ${invalidKeys.join(', ')}`);
    }
    errorMessage = `${parts.join('. ')}. Set all VITE_FIREBASE_* variables in your production build environment and rebuild.`;
  }

  return { isValid, missingKeys, invalidKeys, errorMessage };
}

export const firebaseConfigDiagnostics: FirebaseConfigDiagnostics =
  getFirebaseConfigDiagnostics();

/**
 * Checks whether Firebase Web Client configuration is valid and complete.
 */
export const isFirebaseConfigured = (): boolean => {
  return firebaseConfigDiagnostics.isValid;
};

let initializedApp: FirebaseApp | null = null;
let initError: string | null = firebaseConfigDiagnostics.errorMessage;

if (firebaseConfigDiagnostics.isValid) {
  try {
    initializedApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    initError =
      err instanceof Error
        ? err.message
        : 'Failed to initialize Firebase Web SDK.';
    initializedApp = null;
    console.error('[ResortDesk Firebase Init Error]', initError);
  }
} else {
  console.error(
    '[ResortDesk Firebase Config Error]',
    firebaseConfigDiagnostics.errorMessage
  );
}

/**
 * Shared Firebase singleton app instance (null when config is missing/invalid
 * so module evaluation never crashes the React tree into a white screen).
 */
export const app: FirebaseApp | null = initializedApp;
export const firebaseInitError: string | null = initError;

export default app;
