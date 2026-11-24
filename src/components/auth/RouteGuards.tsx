import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { AppModuleId, PermissionAction } from '../../types';
import UnauthorizedAccessView from './UnauthorizedAccessView';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authLoading, accountStatus } = useAuth();
  const { currentPath, navigate } = useRouter();

  useEffect(() => {
    if (!authLoading && accountStatus === 'unauthenticated' && currentPath !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [authLoading, accountStatus, currentPath, navigate]);

  if (authLoading || accountStatus === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#F7F6F3] flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#004B38] text-white font-serif font-bold text-xl flex items-center justify-center shadow-md">
          M
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Loader2 className="w-4 h-4 text-[#004B38] animate-spin" />
          <span>Verifying Mykonos Cottage staff session...</span>
        </div>
      </div>
    );
  }

  if (accountStatus === 'unauthenticated') {
    return null;
  }

  if (accountStatus === 'disabled') {
    return (
      <div className="min-h-screen w-full bg-[#F7F6F3] flex items-center justify-center">
        <UnauthorizedAccessView variant="disabled" />
      </div>
    );
  }

  if (accountStatus === 'unauthorized') {
    return (
      <div className="min-h-screen w-full bg-[#F7F6F3] flex items-center justify-center">
        <UnauthorizedAccessView variant="unauthorized" />
      </div>
    );
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  moduleId?: AppModuleId;
  requiredPermission?: PermissionAction | PermissionAction[];
  children: React.ReactNode;
}

export function RoleGuard({ moduleId, requiredPermission, children }: RoleGuardProps) {
  const { canAccessModule, hasPermission, defaultModule } = useAuth();
  const { navigateToModuleRoute } = useRouter();

  const moduleAllowed = moduleId ? canAccessModule(moduleId) : true;
  const permissionAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  if (!moduleAllowed || !permissionAllowed) {
    return (
      <UnauthorizedAccessView
        variant="restricted"
        onReturnToDashboard={() => navigateToModuleRoute(defaultModule, { replace: true })}
      />
    );
  }

  return <>{children}</>;
}
