'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { routing } from '@/i18n/routing';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const localePattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard/overview': [{ title: 'Dashboard', link: '/dashboard/overview' }],
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard/overview' }],
  '/dashboard/bots': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Bots', link: '/dashboard/bots' }
  ],
  '/dashboard/members': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Members', link: '/dashboard/members' }
  ],
  '/dashboard/groups': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Groups', link: '/dashboard/groups' }
  ],
  '/dashboard/packages': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Packages', link: '/dashboard/packages' }
  ],
  '/dashboard/commands': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Commands', link: '/dashboard/commands' }
  ],
  '/dashboard/broadcast': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Broadcast', link: '/dashboard/broadcast' }
  ],
  '/dashboard/midtrans': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Midtrans', link: '/dashboard/midtrans' }
  ],
  '/dashboard/billing': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Billing', link: '/dashboard/billing' }
  ],
  '/dashboard/discounts': [
    { title: 'Dashboard', link: '/dashboard/overview' },
    { title: 'Discounts', link: '/dashboard/discounts' }
  ]
};

const labelMapping: Record<string, string> = {
  Dashboard: 'Dasbor',
  Overview: 'Dasbor',
  Bots: 'Bot',
  Members: 'Member',
  Groups: 'Grup',
  Packages: 'Paket',
  Commands: 'Perintah',
  Broadcast: 'Siaran',
  Midtrans: 'Midtrans',
  Billing: 'Penagihan',
  Discounts: 'Diskon'
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const routePath = pathname.replace(localePattern, '/') || '/';

    // Check if it's a tenant path: /:tenant/dashboard/...
    const tenantMatch = routePath.match(/^\/([^/]+)\/dashboard(\/.*)?$/);

    if (tenantMatch) {
      const tenant = tenantMatch[1];
      const subPath = '/dashboard' + (tenantMatch[2] || '');

      let items: BreadcrumbItem[] = [];

      if (routeMapping[subPath]) {
        items = [...routeMapping[subPath]];
      } else {
        const segments = subPath.split('/').filter(Boolean); // ['dashboard', ...]
        items = segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          return {
            title: segment.charAt(0).toUpperCase() + segment.slice(1),
            link: path
          };
        });
      }

      // Prepends tenant slug to all links in items and maps titles
      return items.map((item) => {
        const link =
          item.link === '/dashboard'
            ? `/${tenant}/dashboard/overview`
            : item.link.replace('/dashboard', `/${tenant}/dashboard`);

        return {
          title: labelMapping[item.title] || item.title,
          link
        };
      });
    }

    // Default fallback (e.g. for superadmin or non-tenant pages)
    if (routeMapping[routePath]) {
      return routeMapping[routePath];
    }

    const segments = routePath.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
