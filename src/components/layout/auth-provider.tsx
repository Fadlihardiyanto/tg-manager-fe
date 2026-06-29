'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const pathname = usePathname();

  const hydrated = useRef(false);
  const lastPath = useRef(pathname);

  const hydrate = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          setAuth({
            accessToken: data.accessToken,
            user: data.user,
            client: data.client,
            role: data.role,
            permissions: data.permissions,
            needsOnboarding: data.needsOnboarding
          });
          hydrated.current = true;
          return;
        }
      }
    } catch {}

    if (!accessToken) {
      clearAuth();
    }
  }, [accessToken, setAuth, clearAuth]);

  useEffect(() => {
    if (hydrated.current && lastPath.current === pathname) return;
    lastPath.current = pathname;
    hydrate();
  }, [pathname, hydrate]);

  return <>{children}</>;
}
