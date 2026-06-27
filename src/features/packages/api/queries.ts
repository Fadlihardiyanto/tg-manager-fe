// ============================================================
// Package Queries — React Query Options + Key Factory
// ============================================================

import { queryOptions } from '@tanstack/react-query';
import { getPackages, getPackageById } from './service';

export const packageKeys = {
  all: ['packages'] as const,
  list: () => [...packageKeys.all, 'list'] as const,
  detail: (id: string) => [...packageKeys.all, 'detail', id] as const
};

export const packagesQueryOptions = () =>
  queryOptions({
    queryKey: packageKeys.list(),
    queryFn: () => getPackages()
  });

export const packageByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: packageKeys.detail(id),
    queryFn: () => getPackageById(id)
  });
