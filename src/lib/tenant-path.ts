import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export function useTenantPath() {
  const params = useParams();
  const tenantFromUrl = params?.tenant as string | undefined;
  const client = useAuthStore((s) => s.client);

  const tenant = tenantFromUrl || client?.slug || '';

  const getTenantHref = (path: string) => {
    // If it's a superadmin path or public auth path, don't prefix it
    if (
      path.startsWith('/superadmin') ||
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/check-email') ||
      path.startsWith('/verify-email') ||
      path.startsWith('/forgot-password')
    ) {
      return path;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!tenant) return cleanPath;
    return `/${tenant}${cleanPath}`;
  };

  return {
    tenant,
    getTenantHref
  };
}
