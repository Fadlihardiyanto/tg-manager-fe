'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { botsQueryOptions } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import { Icons } from '@/components/icons';

const ANIMATE = [
  'animate-fade-up',
  'animate-fade-up-delay-1',
  'animate-fade-up-delay-2',
  'animate-fade-up-delay-3'
];

export function BotStats() {
  const { data: botsData } = useSuspenseQuery(botsQueryOptions());
  const { data: groupsData } = useSuspenseQuery(groupsQueryOptions());

  const bots = botsData.data ?? [];
  const groups = groupsData.data ?? [];
  const active = bots.filter((b) => b.is_active).length;

  const cards = [
    {
      label: 'Total Bot',
      value: bots.length,
      subtitle: 'terdaftar',
      icon: Icons.bot,
      accent: 'from-sky-500/15 via-sky-500/5 to-transparent',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
    },
    {
      label: 'Bot Aktif',
      value: active,
      subtitle: bots.length > 0 ? `${Math.round((active / bots.length) * 100)}% aktif` : '',
      icon: Icons.circleCheck,
      accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Bot Nonaktif',
      value: bots.length - active,
      subtitle: bots.length - active > 0 ? 'perlu perhatian' : '',
      icon: Icons.circleX,
      accent: 'from-slate-500/15 via-slate-500/5 to-transparent',
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
    },
    {
      label: 'Total Grup',
      value: groups.length,
      subtitle: groups.length > 0 ? 'dikelola' : 'belum ada',
      icon: Icons.groups,
      accent: 'from-violet-500/15 via-violet-500/5 to-transparent',
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
    }
  ];

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className={cn(
              'group relative gap-2 overflow-hidden border-border/70 bg-gradient-to-br py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              c.accent,
              ANIMATE[i]
            )}
          >
            <CardHeader className='gap-1.5 px-5'>
              <div className='flex items-center justify-between'>
                <CardDescription className='text-foreground/60 text-xs font-semibold tracking-[0.14em] uppercase'>
                  {c.label}
                </CardDescription>
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg transition-colors',
                    c.iconBg
                  )}
                >
                  <Icon className='size-[18px]' />
                </div>
              </div>
              <CardTitle className='text-2xl font-semibold tabular-nums'>{c.value}</CardTitle>
              {c.subtitle && <p className='text-xs text-muted-foreground'>{c.subtitle}</p>}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
