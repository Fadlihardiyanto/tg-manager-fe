'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { ClientSubscription } from '../../api/types';

export function TenantsBarChart({ subs }: { subs: ClientSubscription[] }) {
  const planCounts = subs.reduce((acc, s) => {
    const key = s.plan_name || 'No Plan';
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  const chartData = Array.from(planCounts.entries())
    .map(([plan, tenants]) => ({ plan, tenants }))
    .sort((a, b) => b.tenants - a.tenants);

  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
  ];

  const chartConfig = Object.fromEntries(
    chartData.map((d, i) => [d.plan, { label: d.plan, color: colors[i % colors.length] }])
  ) satisfies ChartConfig;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenants per Plan</CardTitle>
          <CardDescription>Jumlah tenant per paket langganan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground py-12 text-center text-sm'>
            Belum ada data subscription
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenants per Plan</CardTitle>
        <CardDescription>Jumlah tenant per paket langganan</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 4, right: 0, bottom: 4, left: 0 }}
          >
            <XAxis
              dataKey='plan'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 12)}…` : v)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey='tenants' radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((d, i) => (
                <rect key={d.plan} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
