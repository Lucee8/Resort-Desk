import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  subscribeToAuthChanges,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  resetUserPassword,
} from '../firebase/auth';
import {
  FirestoreConnectionStatus,
  testFirestoreConnection,
} from '../services/firestoreBase';
import { doc, getDoc, setDoc, db } from '../firebase';

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  firestoreStatus: FirestoreConnectionStatus;
  firestoreMessage: string | null;
  recheckFirestore: () => Promise<FirestoreConnectionStatus>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firestoreStatus, setFirestoreStatus] =
    useState<FirestoreConnectionStatus>('checking');
  const [firestoreMessage, setFirestoreMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const recheckFirestore = useCallback(async () => {
    setFirestoreStatus('checking');
    const result = await testFirestoreConnection();
    setFirestoreStatus(result.status);
    setFirestoreMessage(result.message || null);
    return result.status;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) {
        void (async () => {
          try {
            const profileRef = doc(db, 'staffProfiles', nextUser.uid);
            const snap = await getDoc(profileRef);
            if (!snap.exists()) {
              await setDoc(profileRef, {
                uid: nextUser.uid,
                email: nextUser.email || '',
                displayName: nextUser.displayName || 'Resort Staff',
                role: 'Receptionist',
                disabled: false,
                createdAt: new Date().toISOString(),
              });
            }
          } catch {
            // Non-blocking: existing rules or admin profile may handle access
          } finally {
            void recheckFirestore();
          }
        })();
      } else {
        void recheckFirestore();
      }
    });
    return () => unsubscribe();
  }, [recheckFirestore]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
    await recheckFirestore();
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    await signUpWithEmail(email, password, displayName);
    await recheckFirestore();
  };

  const signOut = async () => {
    await logOut();
    await recheckFirestore();
  };

  const resetPassword = async (email: string) => {
    await resetUserPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        firestoreStatus,
        firestoreMessage,
        recheckFirestore,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
