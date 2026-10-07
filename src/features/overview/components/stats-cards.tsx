import { Card, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { AnalyticsOverview } from '../api/types';
import type { Icon } from '@/components/icons';
import { cn } from '@/lib/utils';

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
  accent: string;
}[] = [
  {
    label: 'Pendapatan Bulan Ini',
    icon: Icons.trendingUp,
    value: (d) => formatRp(d.total_revenue_this_month),
    accent:
      'from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400'
  },
  {
    label: 'Pelanggan Aktif',
    icon: Icons.user,
    value: (d) => String(d.total_active_members),
    accent: 'from-sky-500/15 via-sky-500/5 to-transparent text-sky-600 dark:text-sky-400'
  },
  {
    label: 'Grup & Total Member',
    icon: Icons.teams,
    value: (d) => `${d.total_groups} / ${d.total_members_in_groups}`,
    accent:
      'from-violet-500/15 via-violet-500/5 to-transparent text-violet-600 dark:text-violet-400'
  },
  {
    label: 'Transaksi Berhasil',
    icon: Icons.check,
    value: (d) => String(d.success_transactions),
    accent: 'from-amber-500/15 via-amber-500/5 to-transparent text-amber-600 dark:text-amber-400'
  }
];

export function StatsCards({ data }: { data: AnalyticsOverview }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((c) => (
        <Card
          key={c.label}
          className={cn(
            '@container/card overflow-hidden border-border/70 bg-gradient-to-br transition-colors duration-200 hover:border-border',
            c.accent
          )}
        >
          <CardHeader className='gap-3'>
            <CardDescription className='text-foreground/70 text-xs font-semibold tracking-[0.18em] uppercase'>
              {c.label}
            </CardDescription>
            <CardTitle className='text-foreground text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {c.value(data)}
            </CardTitle>
            <CardAction>
              <Badge
                variant='outline'
                className='bg-background/70 size-9 rounded-full p-0 shadow-xs backdrop-blur'
              >
                <c.icon className='size-4' />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
