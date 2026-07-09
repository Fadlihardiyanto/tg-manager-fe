import { queryOptions } from '@tanstack/react-query';
import { getPublicCheckout } from './service';

export const publicCheckoutKeys = {
  all: ['public-checkout'] as const,
  detail: (orderId: string) => [...publicCheckoutKeys.all, 'detail', orderId] as const
};

export const publicCheckoutQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: publicCheckoutKeys.detail(orderId),
    queryFn: () => getPublicCheckout(orderId),
    enabled: Boolean(orderId),
    staleTime: 30_000
  });
