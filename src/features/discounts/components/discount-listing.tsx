// ============================================================
// Discount Listing — Server Component (prefetch + dehydrate)
// ============================================================

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { discountsQueryOptions } from '../api/queries';
import { DiscountListingContent } from './discount-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiscountListing() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(discountsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <DiscountListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
