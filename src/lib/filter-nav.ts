import type { NavItem, NavGroup } from '@/types';

export function filterNavItems(
  items: NavItem[],
  permissions: string[],
  role: string | null
): NavItem[] {
  return items
    .filter((item) => {
      if (!item.access) return true;
      if (item.access.permission && !permissions.includes(item.access.permission))
        return false;
      if (item.access.role && item.access.role !== role) return false;
      return true;
    })
    .map((item) => ({
      ...item,
      items: item.items ? filterNavItems(item.items, permissions, role) : []
    }));
}

export function filterNavGroups(
  groups: NavGroup[],
  permissions: string[],
  role: string | null
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, permissions, role)
    }))
    .filter((group) => group.items.length > 0);
}
