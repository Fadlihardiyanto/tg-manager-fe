import { queryOptions } from '@tanstack/react-query';
import { getActiveBilling } from './service';

export const activeBillingKeys = {
  all: ['active-billing'] as const,
  detail: () => [...activeBillingKeys.all, 'detail'] as const
};

export const activeBillingQueryOptions = () =>
  queryOptions({
    queryKey: activeBillingKeys.detail(),
    queryFn: () => getActiveBilling(),
    staleTime: 60_000
  });
