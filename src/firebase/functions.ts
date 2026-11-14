import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import app from './config';

/**
 * Firebase Cloud Functions instance pinned to Mumbai (asia-south1),
 * matching the Cloud Firestore region for resortdesk-mykonos.
 */
export const functions: Functions = getFunctions(app, 'asia-south1');

export { httpsCallable };
export type { Functions };
export default functions;
