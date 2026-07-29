import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import PageContainer from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { botByIdQueryOptions } from '@/features/bots/api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import BotDetailContent from '@/features/bots/components/bot-detail-content';

interface BotDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function BotDetailPage({ params }: BotDetailPageProps) {
  const { id } = await params;

  const queryClient = getQueryClient();
  try {
    await Promise.all([
      queryClient.prefetchQuery(botByIdQueryOptions(id)),
      queryClient.prefetchQuery(groupsQueryOptions())
    ]);
  } catch {
    /* prefetch failed — client will fetch */
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContainer
        pageTitle='Detail Bot'
        pageDescription='Kelola bot, lihat jaringan grup, dan hubungkan grup baru.'
      >
        <Suspense fallback={<Skeleton className='h-64 w-full' />}>
          <BotDetailContent botId={id} />
        </Suspense>
      </PageContainer>
    </HydrationBoundary>
  );
}
