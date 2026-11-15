import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import app, { isFirebaseConfigured } from './config';

let dbInstance: Firestore | null = null;
if (app && isFirebaseConfigured()) {
  try {
    dbInstance = getFirestore(app);
  } catch (err) {
    console.error('[ResortDesk Firestore Init Error]', err);
    dbInstance = null;
  }
}

/**
 * Cloud Firestore instance initialized from the shared Firebase app singleton
 * (Mumbai asia-south1 region provisioned for resortdesk-mykonos).
 * Null when Firebase configuration is missing/invalid.
 */
export const db: Firestore | null = dbInstance;

// Re-export modular Firestore functions and types
export {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  serverTimestamp,
  Timestamp,
};

export type {
  Firestore,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
};

export default db;
