'use client';

import { useQuery } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import {
  clientsQueryOptions,
  subscriptionsQueryOptions,
  adminsQueryOptions,
  plansQueryOptions,
  auditLogsQueryOptions
} from '@/features/superadmin/api/queries';
import { PlatformStatsCards } from '@/features/superadmin/components/overview/platform-stats-cards';
import { SubscriptionPieChart } from '@/features/superadmin/components/overview/subscription-pie-chart';
import { TenantsBarChart } from '@/features/superadmin/components/overview/tenants-bar-chart';
import { RecentActivity } from '@/features/superadmin/components/overview/recent-activity';
import { TopTenantsTable } from '@/features/superadmin/components/overview/top-tenants-table';

export default function SuperadminOverviewPage() {
  const { data: clientsRes, isLoading: clientsLoading } = useQuery(clientsQueryOptions(1, 999));
  const { data: subsRes, isLoading: subsLoading } = useQuery(subscriptionsQueryOptions());
  const { data: adminsRes, isLoading: adminsLoading } = useQuery(adminsQueryOptions(1, 999));
  const { data: plansRes, isLoading: plansLoading } = useQuery(plansQueryOptions());
  const { data: logsRes, isLoading: logsLoading } = useQuery(auditLogsQueryOptions(1, 8));

  const clients = clientsRes?.success ? clientsRes.data : [];
  const subs = subsRes?.success ? subsRes.data : [];
  const admins = adminsRes?.success ? adminsRes.data : [];
  const plans = plansRes?.success ? plansRes.data : [];
  const logs = logsRes?.success ? logsRes.data : [];
  const loading = clientsLoading || subsLoading || adminsLoading || plansLoading || logsLoading;

  if (loading) {
    return (
      <PageContainer pageTitle='Platform Overview'>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='rounded-xl border border-border/70 p-6'>
                <Skeleton className='mb-3 h-3 w-24' />
                <Skeleton className='h-8 w-16' />
              </div>
            ))}
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <div className='lg:col-span-4'>
              <div className='rounded-xl border border-border/70 p-6'>
                <Skeleton className='mb-3 h-5 w-36' />
                <Skeleton className='h-[220px] w-full rounded-lg' />
              </div>
            </div>
            <div className='lg:col-span-3'>
              <div className='rounded-xl border border-border/70 p-6'>
                <Skeleton className='mb-3 mx-auto h-5 w-36' />
                <Skeleton className='mx-auto size-[200px] rounded-full' />
              </div>
            </div>
            <div className='lg:col-span-4'>
              <div className='rounded-xl border border-border/70 p-6'>
                <Skeleton className='mb-3 h-5 w-40' />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='mb-2 h-4 w-full' />
                ))}
              </div>
            </div>
            <div className='lg:col-span-3'>
              <div className='rounded-xl border border-border/70 p-6'>
                <Skeleton className='mb-3 h-5 w-32' />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='mb-2 h-4 w-full' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle='Platform Overview'>
      <div className='space-y-6'>
        <PlatformStatsCards clients={clients} subs={subs} admins={admins} plans={plans} />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='lg:col-span-4'>
            <TenantsBarChart subs={subs} />
          </div>
          <div className='lg:col-span-3'>
            <SubscriptionPieChart subs={subs} />
          </div>
          <div className='lg:col-span-4'>
            <RecentActivity logs={logs} />
          </div>
          <div className='lg:col-span-3'>
            <TopTenantsTable clients={clients} subs={subs} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
