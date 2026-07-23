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
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
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

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const routePath = pathname.replace(localePattern, '/') || '/';

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
