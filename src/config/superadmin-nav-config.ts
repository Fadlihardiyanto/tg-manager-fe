import { NavGroup } from '@/types';

export const superadminNavGroups: NavGroup[] = [
  {
    label: 'Platform',
    items: [
      {
        title: 'Overview',
        url: '/superadmin',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        isActive: false,
        items: []
      },
      {
        title: 'Roles & Permissions',
        url: '/superadmin/roles',
        icon: 'shieldLock',
        isActive: false,
        items: []
      },
      {
        title: 'Admin Users',
        url: '/superadmin/admins',
        icon: 'user',
        isActive: false,
        items: []
      },
      {
        title: 'Tenants',
        url: '/superadmin/tenants',
        icon: 'building',
        isActive: false,
        items: []
      },
      {
        title: 'Billing & Plans',
        url: '/superadmin/plans',
        icon: 'creditCard',
        isActive: false,
        items: []
      },
      {
        title: 'Audit Logs',
        url: '/superadmin/audit-logs',
        icon: 'clipboardList',
        isActive: false,
        items: []
      }
    ]
  }
];
