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
  DocumentSnapshot
} from 'firebase/firestore';
import app from './config';

/**
 * Cloud Firestore instance initialized with the regional database configuration.
 * (Mumbai asia-south1 region provisioned for resortdesk-mykonos)
 */
export const db: Firestore = getFirestore(app);

// Re-export modular Firestore functions and types for future service layers
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
  Timestamp
};

export type {
  Firestore,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
};

export default db;
