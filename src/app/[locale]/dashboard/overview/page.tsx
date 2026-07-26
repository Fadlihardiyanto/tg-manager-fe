import PageContainer from '@/components/layout/page-container';
import { StatsCards } from '@/features/overview/components/stats-cards';
import { AreaGraph } from '@/features/overview/components/area-graph';
import { PieGraph } from '@/features/overview/components/pie-graph';
import { RecentSales } from '@/features/overview/components/recent-sales';
import { getAnalyticsOverview } from '@/features/overview/api/service';

export const metadata = {
  title: 'Dashboard: Overview'
};

export default async function OverviewPage() {
  const data = await getAnalyticsOverview();

  return (
    <PageContainer pageTitle='Overview' pageDescription='Pantau performa bisnis Anda'>
      <div className='flex flex-1 flex-col gap-6'>
        {/* Stats Cards */}
        <StatsCards data={data} />

        {/* Charts Row */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>
            <AreaGraph />
          </div>
          <div className='lg:col-span-3'>
            <PieGraph data={data.package_popularity} />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentSales data={data.recent_orders} />
      </div>
    </PageContainer>
  );
}
