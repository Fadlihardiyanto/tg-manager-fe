'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSuperadminAuthStore } from '@/stores/superadmin-auth-store';
import { usePathname } from 'next/navigation';

export default function SuperadminAuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useSuperadminAuthStore((s) => s.accessToken);
  const setAuth = useSuperadminAuthStore((s) => s.setAuth);
  const clearAuth = useSuperadminAuthStore((s) => s.clearAuth);
  const pathname = usePathname();

  const hydrated = useRef(false);
  const lastPath = useRef(pathname);

  // Only hydrate admin session when on a superadmin route to avoid
  // noisy 401 errors in the browser console when logged in as a tenant.
  const isSuperadminRoute = pathname.includes('/superadmin');

  const hydrate = useCallback(async () => {
    if (!isSuperadminRoute) {
      // Not on a superadmin route — clear stale admin auth if any
      if (!accessToken) clearAuth();
      return;
    }

    try {
      const res = await fetch('/api/auth/admin-session');
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          setAuth({
            accessToken: data.accessToken,
            admin: data.admin,
            role: data.role,
            permissions: data.permissions
          });
          hydrated.current = true;
          return;
        }
      }
    } catch {}

    if (!accessToken) {
      clearAuth();
    }
  }, [accessToken, setAuth, clearAuth, isSuperadminRoute]);

  useEffect(() => {
    if (hydrated.current && lastPath.current === pathname) return;
    lastPath.current = pathname;
    hydrate();
  }, [pathname, hydrate]);

  return <>{children}</>;
}
