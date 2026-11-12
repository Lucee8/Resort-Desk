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
  UploadTaskSnapshot
} from 'firebase/storage';
import app from './config';

/**
 * Firebase Storage instance for resortdesk-mykonos.
 * Handles room photos, inspection audits, and guest documents.
 */
export const storage: FirebaseStorage = getStorage(app);

// Re-export modular Firebase Storage functions and types
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
};

export type {
  FirebaseStorage,
  StorageReference,
  UploadResult,
  UploadTaskSnapshot
};

export default storage;
