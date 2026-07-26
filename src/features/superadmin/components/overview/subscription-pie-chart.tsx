'use client';

import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { ClientSubscription } from '../../api/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'var(--chart-2)' },
  expired: { label: 'Expired', color: 'var(--chart-4)' },
  cancelled: { label: 'Cancelled', color: 'var(--chart-5)' }
};

const FALLBACK_COLOR = 'var(--chart-3)';

export function SubscriptionPieChart({ subs }: { subs: ClientSubscription[] }) {
  const counts = subs.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_CONFIG[status]?.color ?? FALLBACK_COLOR
  }));
  const chartConfig = Object.fromEntries(
    Object.entries(counts).map(([status]) => [
      status,
      {
        label: STATUS_CONFIG[status]?.label ?? status,
        color: STATUS_CONFIG[status]?.color ?? FALLBACK_COLOR
      }
    ])
  ) satisfies ChartConfig;

  if (subs.length === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Distribusi status langganan</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-1 items-center justify-center pb-6'>
          <p className='text-muted-foreground text-sm'>Belum ada data subscription</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>Distribusi status langganan</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[250px]'>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey='status' hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='status'
              innerRadius={55}
              outerRadius={100}
              cornerRadius={6}
              paddingAngle={3}
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>
        <div className='mt-3 flex justify-center gap-4 text-sm'>
          {chartData.map((d) => (
            <div key={d.status} className='flex items-center gap-1.5'>
              <span
                className='inline-block size-2.5 rounded-full'
                style={{ backgroundColor: d.fill }}
              />
              <span className='text-muted-foreground'>
                {STATUS_CONFIG[d.status]?.label ?? d.status}
              </span>
              <span className='font-medium tabular-nums'>{d.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
