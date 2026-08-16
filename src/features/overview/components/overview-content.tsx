'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { getAnalyticsOverview } from '../api/service';
import { StatsCards } from './stats-cards';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';

export function OverviewContent() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['overview'],
    queryFn: () => getAnalyticsOverview(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true
  });

  if (!data) return null;

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>Diperbarui otomatis setiap 30 detik</p>
        <Button
          variant='outline'
          size='sm'
          className='rounded-full'
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label='Muat ulang data'
        >
          <Icons.refresh className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
          Muat Ulang
        </Button>
      </div>

      <StatsCards data={data} />

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <div className='lg:col-span-4'>
          <BarGraph data={data.revenue_chart} />
        </div>
        <div className='lg:col-span-3'>
          <PieGraph data={data.package_popularity} />
        </div>
      </div>

      <RecentSales data={data.recent_orders} />
    </div>
  );
}
