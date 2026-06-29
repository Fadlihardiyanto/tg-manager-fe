import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { AnalyticsOverview } from '../api/types';
import type { Icon } from '@/components/icons';

function formatRp(value: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(parseFloat(value));
}

const cards: {
  label: string;
  icon: Icon;
  value: (d: AnalyticsOverview) => string;
  desc: string;
}[] = [
  {
    label: 'Pendapatan Bulan Ini',
    icon: Icons.trendingUp,
    value: (d) => formatRp(d.total_revenue_this_month),
    desc: 'Total pendapatan bulan ini'
  },
  {
    label: 'Pelanggan Aktif',
    icon: Icons.user,
    value: (d) => String(d.total_active_members),
    desc: 'Total member aktif'
  },
  {
    label: 'Grup & Total Member',
    icon: Icons.teams,
    value: (d) => `${d.total_groups} / ${d.total_members_in_groups}`,
    desc: 'Grup dan total anggota'
  },
  {
    label: 'Transaksi Berhasil',
    icon: Icons.check,
    value: (d) => String(d.success_transactions),
    desc: 'Total transaksi sukses bulan ini'
  }
];

export function StatsCards({ data }: { data: AnalyticsOverview }) {
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((c) => (
        <Card key={c.label} className='@container/card'>
          <CardHeader>
            <CardDescription>{c.label}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {c.value(data)}
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <c.icon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>{c.desc}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
