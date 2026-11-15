import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import app, { isFirebaseConfigured } from './config';

let functionsInstance: Functions | null = null;
if (app && isFirebaseConfigured()) {
  try {
    functionsInstance = getFunctions(app, 'asia-south1');
  } catch (err) {
    console.error('[ResortDesk Functions Init Error]', err);
    functionsInstance = null;
  }
}

/**
 * Firebase Cloud Functions instance pinned to Mumbai (asia-south1),
 * sharing the resortdesk-mykonos app singleton.
 */
export const functions: Functions | null = functionsInstance;

export { httpsCallable };
export type { Functions };
export default functions;
