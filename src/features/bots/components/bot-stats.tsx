'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { botsQueryOptions } from '../api/queries';

const ANIMATE = ['animate-fade-up', 'animate-fade-up-delay-1', 'animate-fade-up-delay-2'];

export function BotStats() {
  const { data } = useSuspenseQuery(botsQueryOptions());
  const bots = data.data ?? [];
  const active = bots.filter((b) => b.is_active).length;

  const cards = [
    {
      label: 'Total Bot',
      value: bots.length,
      accent: 'from-sky-500/15 via-sky-500/5 to-transparent'
    },
    {
      label: 'Bot Aktif',
      value: active,
      accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent'
    },
    {
      label: 'Bot Nonaktif',
      value: bots.length - active,
      accent: 'from-slate-500/15 via-slate-500/5 to-transparent'
    }
  ];

  return (
    <div className='grid grid-cols-3 gap-4'>
      {cards.map((c, i) => (
        <Card
          key={c.label}
          className={cn(
            'gap-2 overflow-hidden border-border/70 bg-gradient-to-br py-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
            c.accent,
            ANIMATE[i]
          )}
        >
          <CardHeader className='gap-1.5 px-5'>
            <CardDescription className='text-foreground/60 text-xs font-semibold tracking-[0.14em] uppercase'>
              {c.label}
            </CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums'>{c.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
