// ============================================================
// Bot Listing — Server Component (prefetch + dehydrate)
// ============================================================
// This is a Server Component. It prefetches bot data on the
// server and dehydrates it into the HydrationBoundary so the
// client-side BotTable (useSuspenseQuery) can pick it up
// without a loading flash.
// ============================================================

import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { botsQueryOptions } from '../api/queries';
import { BotListingContent } from './bot-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default async function BotListing() {
  const queryClient = getQueryClient();
  try {
    await queryClient.prefetchQuery(botsQueryOptions());
  } catch {
    /* prefetch failed — client will fetch */
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <BotListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
