import { queryOptions } from '@tanstack/react-query';
import type {
  ActiveBillingResponse,
  BillingHistoryFilters,
  BillingHistoryResponse,
  PublicPlansResponse
} from './types';

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

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const activeBillingQueryOptions = () =>
  queryOptions({
    queryKey: activeBillingKeys.detail(),
    queryFn: () => fetchJson<ActiveBillingResponse>('/api/tenant/billing/active'),
    staleTime: 60_000
  });

export const publicPlansQueryOptions = () =>
  queryOptions({
    queryKey: publicPlansKeys.list(),
    queryFn: () => fetchJson<PublicPlansResponse>('/api/public/plans'),
    staleTime: 5 * 60_000
  });

export const billingHistoryQueryOptions = (filters: BillingHistoryFilters) =>
  queryOptions({
    queryKey: billingHistoryKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();

      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      return fetchJson<BillingHistoryResponse>(`/api/tenant/billing/history?${params}`);
    },
    staleTime: 60_000
  });
