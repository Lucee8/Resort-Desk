import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  subscribeToAuthChanges,
  signInWithEmail,
  logOut,
  resetUserPassword,
  mapFirebaseAuthError,
} from '../firebase/auth';
import {
  firebaseConfigDiagnostics,
  firebaseInitError,
  isFirebaseConfigured,
} from '../firebase/config';
import { db, doc, getDoc, setDoc } from '../firebase/firestore';
import {
  FirestoreConnectionStatus,
  testFirestoreConnection,
} from '../services/firestoreBase';
import {
  AppModuleId,
  PermissionAction,
  StaffAccountProfile,
  StaffAccountRole,
} from '../types';
import {
  canAccessModule as checkModuleAccess,
  getDefaultModuleForRole,
  getDefaultRouteForRole,
  getEffectivePermissions,
  hasPermission as checkPermission,
  normalizeStaffRole,
  ROLE_DEFINITIONS,
} from '../config/permissions';

export type AccountAuthStatus =
  | 'loading'
  | 'unauthenticated'
  | 'active'
  | 'disabled'
  | 'unauthorized'
  | 'unconfigured';

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  accountStatus: AccountAuthStatus;
  staffProfile: StaffAccountProfile | null;
  role: StaffAccountRole | null;
  permissions: PermissionAction[];
  defaultRoute: string;
  defaultModule: AppModuleId;
  firebaseConfigured: boolean;
  configError: string | null;
  missingConfigKeys: string[];
  firestoreStatus: FirestoreConnectionStatus;
  firestoreMessage: string | null;
  authMessage: string | null;
  recheckFirestore: () => Promise<FirestoreConnectionStatus>;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  canAccessModule: (moduleId: AppModuleId) => boolean;
  hasPermission: (required: PermissionAction | PermissionAction[]) => boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BOOTSTRAPPED_ADMIN_UIDS = new Set<string>([
  'hHUxZag1vXW1NnxYwe34iHodPqf2',
]);

async function resolveStaffAccountForUser(firebaseUser: User): Promise<{
  status: AccountAuthStatus;
  profile: StaffAccountProfile | null;
  role: StaffAccountRole | null;
  permissions: PermissionAction[];
  message: string | null;
}> {
  if (!db) {
    return {
      status: 'unconfigured',
      profile: null,
      role: null,
      permissions: [],
      message: firebaseInitError || 'Firestore is not initialized.',
    };
  }

  let claimsRole: StaffAccountRole | null = null;
  let claimsPermissions: string[] | undefined;
  let claimsActive = true;

  try {
    const tokenResult = await firebaseUser.getIdTokenResult();
    claimsRole = normalizeStaffRole(tokenResult.claims?.role);
    if (Array.isArray(tokenResult.claims?.permissions)) {
      claimsPermissions = tokenResult.claims.permissions.map(String);
    }
    if (tokenResult.claims?.isActive === false) {
      claimsActive = false;
    }
  } catch {
    // Non-fatal if token claims fail; Firestore profile remains primary source
  }

  // 1. Primary canonical schema: staff/{uid}
  try {
    const staffSnap = await getDoc(doc(db, 'staff', firebaseUser.uid));
    if (staffSnap.exists()) {
      const data = staffSnap.data() as Record<string, unknown>;
      const resolvedRole = normalizeStaffRole(data.role) || claimsRole;
      const isActive = data.isActive !== false && claimsActive;
      const resolvedPermissions = getEffectivePermissions(
        resolvedRole,
        Array.isArray(data.permissions) ? (data.permissions as string[]) : claimsPermissions
      );

      const profile: StaffAccountProfile = {
        uid: firebaseUser.uid,
        fullName:
          String(data.fullName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Staff Member'),
        email: String(data.email || firebaseUser.email || ''),
        phone: String(data.phone || ''),
        role: resolvedRole || 'Receptionist',
        permissions: resolvedPermissions,
        department: String(
          data.department || (resolvedRole ? ROLE_DEFINITIONS[resolvedRole].department : 'Front Desk')
        ),
        isActive,
        profileImage: typeof data.profileImage === 'string' ? data.profileImage : undefined,
        createdAt: String(data.createdAt || ''),
        updatedAt: String(data.updatedAt || ''),
      };

      if (!isActive) {
        return {
          status: 'disabled',
          profile,
          role: null,
          permissions: [],
          message:
            'Your staff account has been deactivated by the Administrator. Please contact Mykonos Cottage management.',
        };
      }

      if (!resolvedRole) {
        return {
          status: 'unauthorized',
          profile,
          role: null,
          permissions: [],
          message:
            'Your staff profile does not have a valid role assigned. Contact your Administrator.',
        };
      }

      return {
        status: 'active',
        profile,
        role: resolvedRole,
        permissions: resolvedPermissions,
        message: null,
      };
    }
  } catch {
    // Continue to backward-compatible collections if staff/{uid} is absent or restricted
  }

  // 2. Legacy admins/{uid} backward compatibility
  try {
    const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
    if (adminSnap.exists()) {
      const adminData = adminSnap.data() as Record<string, unknown>;
      const permissions = getEffectivePermissions('Administrator');
      const profile: StaffAccountProfile = {
        uid: firebaseUser.uid,
        fullName: String(
          adminData.fullName ||
            adminData.displayName ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'Resort Administrator'
        ),
        email: String(adminData.email || firebaseUser.email || ''),
        phone: String(adminData.phone || ''),
        role: 'Administrator',
        permissions,
        department: 'Management',
        isActive: true,
        profileImage:
          typeof adminData.profileImage === 'string' ? adminData.profileImage : undefined,
        createdAt: String(adminData.createdAt || ''),
        updatedAt: String(adminData.updatedAt || ''),
      };
      return {
        status: 'active',
        profile,
        role: 'Administrator',
        permissions,
        message: null,
      };
    }
  } catch {
    // Continue to staffProfiles/{uid}
  }

  // 3. Legacy staffProfiles/{uid} backward compatibility
  try {
    const legacySnap = await getDoc(doc(db, 'staffProfiles', firebaseUser.uid));
    if (legacySnap.exists()) {
      const data = legacySnap.data() as Record<string, unknown>;
      const resolvedRole = normalizeStaffRole(data.role) || claimsRole;
      const isActive = data.disabled !== true && data.isActive !== false && claimsActive;
      const permissions = getEffectivePermissions(
        resolvedRole,
        Array.isArray(data.permissions) ? (data.permissions as string[]) : claimsPermissions
      );
      const profile: StaffAccountProfile = {
        uid: firebaseUser.uid,
        fullName: String(
          data.displayName ||
            data.fullName ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'Staff Member'
        ),
        email: String(data.email || firebaseUser.email || ''),
        phone: String(data.phone || ''),
        role: resolvedRole || 'Receptionist',
        permissions,
        department: String(
          data.department || (resolvedRole ? ROLE_DEFINITIONS[resolvedRole].department : 'Front Desk')
        ),
        isActive,
        createdAt: String(data.createdAt || ''),
        updatedAt: String(data.updatedAt || ''),
      };

      if (!isActive) {
        return {
          status: 'disabled',
          profile,
          role: null,
          permissions: [],
          message: 'Your staff account has been disabled. Contact the Resort Administrator.',
        };
      }

      if (resolvedRole) {
        return {
          status: 'active',
          profile,
          role: resolvedRole,
          permissions,
          message: null,
        };
      }
    }
  } catch {
    // Fall through to claims check
  }

  // 4. Custom claims fallback (if deployed via Admin SDK without Firestore doc read)
  if (claimsRole) {
    if (!claimsActive) {
      return {
        status: 'disabled',
        profile: null,
        role: null,
        permissions: [],
        message: 'Your staff account is deactivated.',
      };
    }
    const permissions = getEffectivePermissions(claimsRole, claimsPermissions);
    return {
      status: 'active',
      profile: {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Staff Member',
        email: firebaseUser.email || '',
        phone: '',
        role: claimsRole,
        permissions,
        department: ROLE_DEFINITIONS[claimsRole].department,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      role: claimsRole,
      permissions,
      message: null,
    };
  }

  // 5. Bootstrapped Administrator fallback for provisioned initial admin UID
  if (BOOTSTRAPPED_ADMIN_UIDS.has(firebaseUser.uid)) {
    const permissions = getEffectivePermissions('Administrator');
    const nowISO = new Date().toISOString();
    const profile: StaffAccountProfile = {
      uid: firebaseUser.uid,
      fullName:
        firebaseUser.displayName ||
        firebaseUser.email?.split('@')[0] ||
        'Resort Administrator',
      email: firebaseUser.email || 'luceecode@gmail.com',
      phone: '',
      role: 'Administrator',
      permissions,
      department: 'Management',
      isActive: true,
      createdAt: nowISO,
      updatedAt: nowISO,
    };

    // Best-effort sync of canonical staff/{uid} document when Firestore rules permit
    try {
      await setDoc(doc(db, 'staff', firebaseUser.uid), profile, { merge: true });
    } catch {
      // Non-fatal if Firestore rules are not yet deployed
    }

    return {
      status: 'active',
      profile,
      role: 'Administrator',
      permissions,
      message: null,
    };
  }

  return {
    status: 'unauthorized',
    profile: null,
    role: null,
    permissions: [],
    message:
      'Your Firebase account does not have an active Mykonos Cottage staff role assigned. Contact an Administrator to provision access.',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(configured);
  const [accountStatus, setAccountStatus] = useState<AccountAuthStatus>(
    configured ? 'loading' : 'unconfigured'
  );
  const [staffProfile, setStaffProfile] = useState<StaffAccountProfile | null>(null);
  const [role, setRole] = useState<StaffAccountRole | null>(null);
  const [permissions, setPermissions] = useState<PermissionAction[]>([]);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

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

  const loadUserProfile = useCallback(
    async (nextUser: User | null) => {
      if (!configured) {
        setAccountStatus('unconfigured');
        setStaffProfile(null);
        setRole(null);
        setPermissions([]);
        setAuthLoading(false);
        return;
      }

      if (!nextUser) {
        setUser(null);
        setStaffProfile(null);
        setRole(null);
        setPermissions([]);
        setAuthMessage(null);
        setAccountStatus('unauthenticated');
        setAuthLoading(false);
        setFirestoreStatus('permission-denied');
        return;
      }

      setUser(nextUser);
      setAuthLoading(true);
      const resolved = await resolveStaffAccountForUser(nextUser);
      setStaffProfile(resolved.profile);
      setRole(resolved.role);
      setPermissions(resolved.permissions);
      setAuthMessage(resolved.message);
      setAccountStatus(resolved.status);
      setAuthLoading(false);

      if (resolved.status === 'active') {
        void recheckFirestore();
      } else {
        setFirestoreStatus('permission-denied');
      }
    },
    [configured, recheckFirestore]
  );

  useEffect(() => {
    if (!configured) {
      setAuthLoading(false);
      setAccountStatus('unconfigured');
      setFirestoreStatus('unconfigured');
      setFirestoreMessage(firebaseInitError);
      return;
    }

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      void loadUserProfile(nextUser);
    });
    return () => unsubscribe();
  }, [configured, loadUserProfile]);

  const refreshProfile = useCallback(async () => {
    await loadUserProfile(user);
  }, [loadUserProfile, user]);

  const signIn = async (email: string, password: string, rememberMe = true) => {
    try {
      const cred = await signInWithEmail(email, password, rememberMe);
      await loadUserProfile(cred.user);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const signOut = async () => {
    await logOut();
    setUser(null);
    setStaffProfile(null);
    setRole(null);
    setPermissions([]);
    setAuthMessage(null);
    setAccountStatus('unauthenticated');
    setIsAuthModalOpen(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await resetUserPassword(email);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  };

  const canAccessModule = useCallback(
    (moduleId: AppModuleId) => checkModuleAccess(role, permissions, moduleId),
    [role, permissions]
  );

  const hasPermission = useCallback(
    (required: PermissionAction | PermissionAction[]) => checkPermission(permissions, required),
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        accountStatus,
        staffProfile,
        role,
        permissions,
        defaultRoute: getDefaultRouteForRole(role),
        defaultModule: getDefaultModuleForRole(role),
        firebaseConfigured: configured,
        configError: firebaseInitError,
        missingConfigKeys: [
          ...firebaseConfigDiagnostics.missingKeys,
          ...firebaseConfigDiagnostics.invalidKeys,
        ],
        firestoreStatus,
        firestoreMessage,
        authMessage,
        recheckFirestore,
        refreshProfile,
        signIn,
        signOut,
        resetPassword,
        canAccessModule,
        hasPermission,
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
