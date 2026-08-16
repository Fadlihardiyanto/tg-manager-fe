'use client';

import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '../api/service';
import { StatsCards } from './stats-cards';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';

export function OverviewContent() {
  const { data } = useQuery({
    queryKey: ['overview'],
    queryFn: () => getAnalyticsOverview(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true
  });

  if (!data) return null;

  return (
    <div className='flex flex-1 flex-col gap-6'>
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
