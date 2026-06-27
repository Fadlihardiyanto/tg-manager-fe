// ============================================================
// Discount Queries — React Query Options + Key Factory
// ============================================================

import { queryOptions } from '@tanstack/react-query';
import { getDiscounts } from './service';

export const discountKeys = {
  all: ['discounts'] as const,
  list: () => [...discountKeys.all, 'list'] as const,
  detail: (id: string) => [...discountKeys.all, 'detail', id] as const
};

export const discountsQueryOptions = () =>
  queryOptions({
    queryKey: discountKeys.list(),
    queryFn: () => getDiscounts()
  });
