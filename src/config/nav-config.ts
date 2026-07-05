import { NavGroup } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Billing Plan',
        url: '/dashboard/billing',
        icon: 'billing',
        isActive: false,
        items: []
      },

      {
        title: 'Bots',
        url: '/dashboard/bots',
        icon: 'bot',
        shortcut: ['b', 'b'],
        isActive: false,
        items: []
      },
      {
        title: 'Members',
        url: '/dashboard/members',
        icon: 'user',
        isActive: false,
        items: []
      },
      {
        title: 'Groups',
        url: '/dashboard/groups',
        icon: 'groups',
        shortcut: ['g', 'g'],
        isActive: false,
        items: []
      },
      {
        title: 'Packages',
        url: '/dashboard/packages',
        icon: 'coin',
        isActive: false,
        items: []
      },
      {
        title: 'Commands',
        url: '/dashboard/commands',
        icon: 'command',
        isActive: false,
        items: []
      },
      {
        title: 'Broadcast',
        url: '/dashboard/broadcast',
        icon: 'send',
        shortcut: ['b', 'r'],
        isActive: false,
        items: []
      },
      {
        title: 'Discounts',
        url: '/dashboard/discounts',
        icon: 'tag',
        isActive: false,
        items: []
      },
      {
        title: 'React Query',
        url: '/dashboard/react-query',
        icon: 'code',
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '',
    items: [
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: true,
        items: [
          {
            title: 'Login',
            shortcut: ['l', 'l'],
            url: '/',
            icon: 'login'
          }
        ]
      }
    ]
  }
];
