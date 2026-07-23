import PageContainer from '@/components/layout/page-container';
import { StatsCards } from '@/features/overview/components/stats-cards';
import { getAnalyticsOverview } from '@/features/overview/api/service';
import React from 'react';

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const data = await getAnalyticsOverview();

  return (
    <PageContainer pageTitle='Dashboard'>
      <div className='flex flex-1 flex-col gap-5'>
        <StatsCards data={data} />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{sales}</div>
        </div>
      </div>
    </PageContainer>
  );
}
