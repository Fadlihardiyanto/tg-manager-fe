// ============================================================
// Group Listing — Server Component (prefetch + dehydrate)
// ============================================================

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { groupsQueryOptions } from '../api/queries';
import { GroupListingContent } from './group-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default async function GroupListing() {
  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(groupsQueryOptions());
  } catch {
    /* prefetch failed — client will fetch */
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <GroupListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
