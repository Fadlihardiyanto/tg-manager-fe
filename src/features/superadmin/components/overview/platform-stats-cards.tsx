import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons, type Icon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Client, ClientSubscription, AdminUser, BillingPlan } from '../../api/types';

interface PlatformStatsCardsProps {
  clients: Client[];
  subs: ClientSubscription[];
  admins: AdminUser[];
  plans: BillingPlan[];
}

const cards: {
  label: string;
  icon: Icon;
  value: (p: PlatformStatsCardsProps) => { primary: number; secondary: string };
  desc: string;
  accent: string;
}[] = [
  {
    label: 'Total Tenants',
    icon: Icons.user,
    value: (p) => ({
      primary: p.clients.filter((c) => c.is_active).length,
      secondary: `/ ${p.clients.length}`
    }),
    desc: 'Klien aktif dari total terdaftar',
    accent: 'from-sky-500/15 via-sky-500/5 to-transparent text-sky-600'
  },
  {
    label: 'Active Subscriptions',
    icon: Icons.check,
    value: (p) => ({
      primary: p.subs.filter((s) => s.status === 'active').length,
      secondary: `/ ${p.subs.length}`
    }),
    desc: 'Langganan aktif bulan ini',
    accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600'
  },
  {
    label: 'Admin Users',
    icon: Icons.teams,
    value: (p) => ({
      primary: p.admins.filter((a) => a.is_active).length,
      secondary: `/ ${p.admins.length}`
    }),
    desc: 'Admin aktif dari total terdaftar',
    accent: 'from-violet-500/15 via-violet-500/5 to-transparent text-violet-600'
  },
  {
    label: 'Plans',
    icon: Icons.chartBar,
    value: (p) => ({
      primary: p.plans.filter((pl) => pl.is_active).length,
      secondary: `/ ${p.plans.length}`
    }),
    desc: 'Paket langganan tersedia',
    accent: 'from-amber-500/15 via-amber-500/5 to-transparent text-amber-600'
  }
];

export function PlatformStatsCards(props: PlatformStatsCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((c) => {
        const { primary, secondary } = c.value(props);
        return (
          <Card
            key={c.label}
            className={cn(
              '@container/card overflow-hidden border-border/70 bg-gradient-to-br shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              c.accent
            )}
          >
            <CardHeader className='gap-3'>
              <CardDescription className='text-foreground/70 text-xs font-semibold tracking-[0.18em] uppercase'>
                {c.label}
              </CardDescription>
              <CardTitle className='text-foreground text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {primary}
                <span className='text-muted-foreground ml-1.5 text-lg font-normal'>
                  {secondary}
                </span>
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
            <CardFooter className='text-muted-foreground flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>{c.desc}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
