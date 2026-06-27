// ============================================================
// Group Queries — React Query Options + Key Factory
// ============================================================

import { queryOptions } from '@tanstack/react-query';
import { getGroups, getGroupById } from './service';

export const groupKeys = {
  all: ['groups'] as const,
  list: () => [...groupKeys.all, 'list'] as const,
  detail: (id: string) => [...groupKeys.all, 'detail', id] as const
};

export const groupsQueryOptions = () =>
  queryOptions({
    queryKey: groupKeys.list(),
    queryFn: () => getGroups()
  });

export const groupByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: groupKeys.detail(id),
    queryFn: () => getGroupById(id)
  });
