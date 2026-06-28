import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { commandsQueryOptions } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';
import { CommandListingContent } from './command-listing-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommandListing() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(commandsQueryOptions());
  void queryClient.prefetchQuery(botsQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <CommandListingContent />
      </Suspense>
    </HydrationBoundary>
  );
}
