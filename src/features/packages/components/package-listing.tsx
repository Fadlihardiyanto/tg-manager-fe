// ============================================================
// Package Listing — Server Component (prefetch + dehydrate)
// ============================================================

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { packagesQueryOptions } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import { PackageListingContent } from './package-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default async function PackageListing() {
  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(packagesQueryOptions());
  } catch {
    /* prefetch failed */
  }
  try {
    await queryClient.prefetchQuery(groupsQueryOptions());
  } catch {
    /* prefetch failed */
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <PackageListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
