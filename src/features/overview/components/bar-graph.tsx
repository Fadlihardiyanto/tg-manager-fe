'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { RevenueChartItem } from '../api/types';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
  return `Rp${value}`;
}

export function BarGraph({ data }: { data: RevenueChartItem[] }) {
  // ponytail: parse string revenue to number for recharts
  const chartData = data.map((d) => ({ ...d, revenue: parseFloat(d.revenue) }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Pendapatan 30 Hari</CardTitle>
        <CardDescription>Revenue harian 30 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey='date'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatDate}
              interval='preserveStartEnd'
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatCompact(v)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value) =>
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(Number(value))
                  }
                />
              }
            />
            <Bar dataKey='revenue' fill='var(--color-revenue)' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
