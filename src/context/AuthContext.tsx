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
  firebaseConfigDiagnostics,
  firebaseInitError,
  isFirebaseConfigured,
} from '../firebase/config';
import {
  FirestoreConnectionStatus,
  testFirestoreConnection,
} from '../services/firestoreBase';

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  firebaseConfigured: boolean;
  configError: string | null;
  missingConfigKeys: string[];
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
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(configured);
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreConnectionStatus>(
    configured ? 'checking' : 'unconfigured'
  );
  const [firestoreMessage, setFirestoreMessage] = useState<string | null>(
    configured ? null : firebaseInitError
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const recheckFirestore = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setFirestoreStatus('unconfigured');
      setFirestoreMessage(firebaseInitError);
      return 'unconfigured';
    }
    setFirestoreStatus('checking');
    const result = await testFirestoreConnection();
    setFirestoreStatus(result.status);
    setFirestoreMessage(result.message || null);
    return result.status;
  }, []);

  useEffect(() => {
    if (!configured) {
      setAuthLoading(false);
      setFirestoreStatus('unconfigured');
      setFirestoreMessage(firebaseInitError);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      void recheckFirestore();
    });
    return () => unsubscribe();
  }, [configured, recheckFirestore]);

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
        firebaseConfigured: configured,
        configError: firebaseInitError,
        missingConfigKeys: [
          ...firebaseConfigDiagnostics.missingKeys,
          ...firebaseConfigDiagnostics.invalidKeys,
        ],
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
