import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StatsCards } from '@/features/overview/components/stats-cards';
import { BarGraph } from '@/features/overview/components/bar-graph';
import { PieGraph } from '@/features/overview/components/pie-graph';
import { RecentSales } from '@/features/overview/components/recent-sales';
import { Icons } from '@/components/icons';
import { getAnalyticsOverview } from '@/features/overview/api/service';

export const metadata = {
  title: 'Dashboard: Dasbor'
};

const quickActions = [
  { label: 'Tambah Bot', href: '/dashboard/bots', icon: Icons.robot },
  { label: 'Hubungkan Grup', href: '/dashboard/groups', icon: Icons.teams },
  { label: 'Buat Broadcast', href: '/dashboard/broadcast', icon: Icons.send },
  { label: 'Kelola Paket', href: '/dashboard/packages', icon: Icons.product }
];

export default async function OverviewPage() {
  const data = await getAnalyticsOverview();

  return (
    <PageContainer pageTitle='Dasbor' pageDescription='Pantau performa bisnis Anda'>
      <div className='flex flex-1 flex-col gap-6'>
        {/* Stats Cards */}
        <StatsCards data={data} />

        {/* Quick Actions */}
        <div className='flex flex-wrap gap-3'>
          {quickActions.map((action) => (
            <Button key={action.href} asChild variant='outline' size='sm' className='rounded-full'>
              <Link href={action.href}>
                <action.icon className='mr-2 size-4' />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Charts Row */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <div className='lg:col-span-4'>
            <BarGraph data={data.revenue_chart} />
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
