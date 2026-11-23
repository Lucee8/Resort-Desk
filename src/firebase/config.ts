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

export type FirebaseEnvVarStatus = 'configured' | 'defaulted' | 'missing' | 'invalid';

export interface FirebaseEnvVarCheck {
  key: string;
  required: boolean;
  presentInEnv: boolean;
  status: FirebaseEnvVarStatus;
  note: string;
}

export interface FirebaseConfigDiagnostics {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
  missingEnvVars: string[];
  envVarChecks: FirebaseEnvVarCheck[];
  errorMessage: string | null;
}

export function getFirebaseConfigDiagnostics(): FirebaseConfigDiagnostics {
  const missingKeys: string[] = [];
  const invalidKeys: string[] = [];
  const missingEnvVars: string[] = [];

  const rawApiKey = cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY);
  const rawAuthDomain = cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  const rawProjectId = cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const rawStorageBucket = cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
  const rawMessagingSenderId = cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
  const rawAppId = cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID);

  const envVarChecks: FirebaseEnvVarCheck[] = [];

  // 1. VITE_FIREBASE_API_KEY (blocking if missing or malformed)
  if (isPlaceholderOrEmpty(rawApiKey)) {
    missingKeys.push('VITE_FIREBASE_API_KEY');
    missingEnvVars.push('VITE_FIREBASE_API_KEY');
    envVarChecks.push({
      key: 'VITE_FIREBASE_API_KEY',
      required: true,
      presentInEnv: false,
      status: 'missing',
      note: 'Missing at Vite build time (no fallback allowed).',
    });
  } else if (!rawApiKey.startsWith('AIza') || rawApiKey.length < 25) {
    invalidKeys.push('VITE_FIREBASE_API_KEY');
    envVarChecks.push({
      key: 'VITE_FIREBASE_API_KEY',
      required: true,
      presentInEnv: true,
      status: 'invalid',
      note: 'Expected a valid Firebase Web API key starting with "AIza".',
    });
  } else {
    envVarChecks.push({
      key: 'VITE_FIREBASE_API_KEY',
      required: true,
      presentInEnv: true,
      status: 'configured',
      note: 'Configured via build environment.',
    });
  }

  // 2–6. Project identifiers (resortdesk-mykonos defaults preserved, missing env vars still tracked)
  const projectFields: Array<{
    key: string;
    rawValue: string;
    effectiveValue: string;
  }> = [
    {
      key: 'VITE_FIREBASE_AUTH_DOMAIN',
      rawValue: rawAuthDomain,
      effectiveValue: firebaseConfig.authDomain,
    },
    {
      key: 'VITE_FIREBASE_PROJECT_ID',
      rawValue: rawProjectId,
      effectiveValue: firebaseConfig.projectId,
    },
    {
      key: 'VITE_FIREBASE_STORAGE_BUCKET',
      rawValue: rawStorageBucket,
      effectiveValue: firebaseConfig.storageBucket,
    },
    {
      key: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
      rawValue: rawMessagingSenderId,
      effectiveValue: firebaseConfig.messagingSenderId,
    },
    {
      key: 'VITE_FIREBASE_APP_ID',
      rawValue: rawAppId,
      effectiveValue: firebaseConfig.appId,
    },
  ];

  for (const field of projectFields) {
    const rawMissing = isPlaceholderOrEmpty(field.rawValue);
    if (rawMissing) {
      missingEnvVars.push(field.key);
    }
    if (isPlaceholderOrEmpty(field.effectiveValue)) {
      missingKeys.push(field.key);
      envVarChecks.push({
        key: field.key,
        required: true,
        presentInEnv: false,
        status: 'missing',
        note: 'Missing from build environment.',
      });
    } else {
      envVarChecks.push({
        key: field.key,
        required: true,
        presentInEnv: !rawMissing,
        status: rawMissing ? 'defaulted' : 'configured',
        note: rawMissing
          ? 'Not set in build env; using resortdesk-mykonos default.'
          : 'Configured via build environment.',
      });
    }
  }

  // 7. Optional VITE_FIREBASE_MEASUREMENT_ID
  const rawMeasValid = !isPlaceholderOrEmpty(rawMeasurementId);
  envVarChecks.push({
    key: 'VITE_FIREBASE_MEASUREMENT_ID',
    required: false,
    presentInEnv: rawMeasValid,
    status: rawMeasValid ? 'configured' : 'missing',
    note: rawMeasValid ? 'Configured via build environment.' : 'Optional (Analytics).',
  });

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

  return {
    isValid,
    missingKeys,
    invalidKeys,
    missingEnvVars,
    envVarChecks,
    errorMessage,
  };
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
