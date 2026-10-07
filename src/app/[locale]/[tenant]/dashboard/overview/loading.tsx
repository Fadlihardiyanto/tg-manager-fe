import { StatsCardsSkeleton } from '@/features/overview/components/stats-cards-skeleton';
import { AreaGraphSkeleton } from '@/features/overview/components/area-graph-skeleton';
import { PieGraphSkeleton } from '@/features/overview/components/pie-graph-skeleton';
import { RecentSalesSkeleton } from '@/features/overview/components/recent-sales-skeleton';
import PageContainer from '@/components/layout/page-container';

export default function OverviewLoading() {
  return (
    <PageContainer pageTitle='Dasbor'>
      <div className='flex flex-1 flex-col gap-6'>
        <StatsCardsSkeleton />

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>
            <AreaGraphSkeleton />
          </div>
          <div className='lg:col-span-3'>
            <PieGraphSkeleton />
          </div>
        </div>

        <RecentSalesSkeleton />
      </div>
    </PageContainer>
  );
}
