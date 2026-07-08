import { queryOptions } from '@tanstack/react-query';
import { getActiveBilling, getBillingHistory, getPublicPlans } from './service';
import type { BillingHistoryFilters } from './types';

export const activeBillingKeys = {
  all: ['active-billing'] as const,
  detail: () => [...activeBillingKeys.all, 'detail'] as const
};

export const publicPlansKeys = {
  all: ['public-plans'] as const,
  list: () => [...publicPlansKeys.all, 'list'] as const
};

export const billingHistoryKeys = {
  all: ['billing-history'] as const,
  list: (filters: BillingHistoryFilters) => [...billingHistoryKeys.all, 'list', filters] as const
};

export const activeBillingQueryOptions = () =>
  queryOptions({
    queryKey: activeBillingKeys.detail(),
    queryFn: () => getActiveBilling(),
    staleTime: 60_000
  });

export const publicPlansQueryOptions = () =>
  queryOptions({
    queryKey: publicPlansKeys.list(),
    queryFn: () => getPublicPlans(),
    staleTime: 5 * 60_000
  });

export const billingHistoryQueryOptions = (filters: BillingHistoryFilters) =>
  queryOptions({
    queryKey: billingHistoryKeys.list(filters),
    queryFn: () => getBillingHistory(filters),
    staleTime: 60_000
  });
