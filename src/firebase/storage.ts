import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadResult,
  UploadTaskSnapshot,
} from 'firebase/storage';
import app, { isFirebaseConfigured } from './config';

let storageInstance: FirebaseStorage | null = null;
if (app && isFirebaseConfigured()) {
  try {
    storageInstance = getStorage(app);
  } catch (err) {
    console.error('[ResortDesk Storage Init Error]', err);
    storageInstance = null;
  }
}

/**
 * Firebase Storage instance for resortdesk-mykonos using the shared app singleton.
 * Null when Firebase configuration is missing/invalid.
 */
export const storage: FirebaseStorage | null = storageInstance;

// Re-export modular Firebase Storage functions and types
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
};

export type {
  FirebaseStorage,
  StorageReference,
  UploadResult,
  UploadTaskSnapshot,
};

export default storage;
