'use client';

import { LabelList, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { PackagePopularityItem } from '../api/types';

export function PieGraph({ data }: { data: PackagePopularityItem[] }) {
  const colors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];
  const chartData = data.map((d, i) => ({
    ...d,
    fill: `var(${colors[i % colors.length]})`
  }));
  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      `pkg${i}`,
      { label: d.package_name, color: `var(${colors[i % colors.length]})` }
    ])
  ) satisfies ChartConfig;

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Popularitas Paket</CardTitle>
        <CardDescription>Proporsi penjualan per paket</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[250px]'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='package_name' hideLabel />} />
            <Pie
              data={chartData}
              dataKey='count'
              nameKey='package_name'
              innerRadius={30}
              radius={10}
              cornerRadius={8}
              paddingAngle={4}
            >
              <LabelList
                dataKey='count'
                stroke='none'
                fontSize={12}
                fontWeight={500}
                fill='currentColor'
                formatter={(value: number) => value.toString()}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
