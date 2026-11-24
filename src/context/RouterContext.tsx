import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppModuleId } from '../types';
import { getModuleFromPath, getPathFromModule } from '../config/permissions';

interface RouterContextValue {
  currentPath: string;
  currentRouteTarget: AppModuleId | 'login';
  navigate: (to: string, options?: { replace?: boolean }) => void;
  navigateToModuleRoute: (moduleId: AppModuleId, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function normalizePathname(raw: string): string {
  if (!raw) return '/';
  const cleaned = raw.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return cleaned || '/';
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePathname(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const target = normalizePathname(to);
    const current = normalizePathname(window.location.pathname);
    if (target !== current) {
      if (options?.replace) {
        window.history.replaceState({}, '', target);
      } else {
        window.history.pushState({}, '', target);
      }
    }
    setCurrentPath(target);
  }, []);

  const navigateToModuleRoute = useCallback(
    (moduleId: AppModuleId, options?: { replace?: boolean }) => {
      navigate(getPathFromModule(moduleId), options);
    },
    [navigate]
  );

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        currentRouteTarget: getModuleFromPath(currentPath),
        navigate,
        navigateToModuleRoute,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside RouterProvider');
  }
  return ctx;
}
