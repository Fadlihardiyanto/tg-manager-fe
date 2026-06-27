// ============================================================
// Group Listing — Server Component (prefetch + dehydrate)
// ============================================================

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { groupsQueryOptions } from '../api/queries';
import { GroupListingContent } from './group-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupListing() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(groupsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <GroupListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
