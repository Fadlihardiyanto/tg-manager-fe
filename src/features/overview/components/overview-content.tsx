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
import PageContainer from '@/components/layout/page-container';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTenantPath } from '@/lib/tenant-path';
import Link from 'next/link';

const quickActions = [
  { label: 'Tambah Bot', href: '/dashboard/bots', icon: Icons.robot },
  { label: 'Hubungkan Grup', href: '/dashboard/groups', icon: Icons.teams },
  { label: 'Buat Broadcast', href: '/dashboard/broadcast', icon: Icons.send },
  { label: 'Kelola Paket', href: '/dashboard/packages', icon: Icons.product }
];

export function OverviewContent() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['overview'],
    queryFn: () => getAnalyticsOverview(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true
  });
  const { getTenantHref } = useTenantPath();

  if (!data) return null;

  return (
    <PageContainer
      pageTitle='Dasbor'
      pageDescription='Pantau performa bisnis Anda'
      pageHeaderAction={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='rounded-full'>
              <Icons.add className='mr-2 h-4 w-4' />
              Aksi Cepat
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {quickActions.map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={getTenantHref(action.href)}>
                  <action.icon className='mr-2 size-4' />
                  {action.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
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
    </PageContainer>
  );
}
