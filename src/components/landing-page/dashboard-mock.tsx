'use client';

import { cn } from '@/lib/utils';

const MOCK_STATS = [
  {
    label: 'Bot',
    value: '3',
    accent: 'from-blue-500/15 via-blue-500/5 to-transparent',
    ring: 'ring-blue-500/20'
  },
  {
    label: 'Aktif',
    value: '2',
    accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    ring: 'ring-emerald-500/20'
  },
  {
    label: 'Grup',
    value: '5',
    accent: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    ring: 'ring-cyan-500/20'
  },
  {
    label: 'Member',
    value: '142',
    accent: 'from-amber-500/15 via-amber-500/5 to-transparent',
    ring: 'ring-amber-500/20'
  }
];

const MOCK_BOTS = [
  {
    username: 'paymentBot',
    roleLabel: 'All-in-one',
    roleColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    roleStripe: 'from-amber-400 to-amber-500',
    active: true,
    groups: 3,
    telegramId: '7123456789'
  },
  {
    username: 'welcomeBot',
    roleLabel: 'Gatekeeper',
    roleColor: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    roleStripe: 'from-violet-400 to-violet-500',
    active: false,
    groups: 0,
    telegramId: '7987654321'
  },
  {
    username: 'premiumBot',
    roleLabel: 'Penjualan',
    roleColor: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    roleStripe: 'from-sky-400 to-sky-500',
    active: true,
    groups: 2,
    telegramId: '7555666777'
  }
];

function StatCard({ label, value, accent, ring }: (typeof MOCK_STATS)[number]) {
  return (
    <div className='flex flex-col gap-1 rounded-xl border border-border/70 bg-card p-3.5 shadow-sm'>
      <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </span>
      <span className='text-2xl font-bold tracking-tight tabular-nums text-foreground'>
        {value}
      </span>
      <div className={cn('mt-1 h-1 w-full rounded-full bg-gradient-to-r opacity-60', accent)} />
    </div>
  );
}

function MockBotCard({ bot }: { bot: (typeof MOCK_BOTS)[number] }) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border/60 bg-card shadow-sm',
        !bot.active && 'opacity-75'
      )}
    >
      <div className={cn('h-1 rounded-t-lg bg-gradient-to-r', bot.roleStripe)} />
      <div className='flex flex-col p-3.5 gap-3'>
        <div className='flex items-center gap-2.5'>
          <div className='relative shrink-0'>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-lg ring-1',
                bot.active
                  ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-primary/20'
                  : 'bg-muted'
              )}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className={cn('size-5', bot.active ? 'text-primary' : 'text-muted-foreground')}
              >
                <rect x='3' y='3' width='18' height='14' rx='2' />
                <path d='M12 17v3' />
                <path d='M8 21h8' />
                <path d='M9 9h.01' />
                <path d='M15 9h.01' />
              </svg>
            </div>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background',
                bot.active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
              )}
            />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold truncate text-foreground'>@{bot.username}</p>
            <p className='text-[11px] text-muted-foreground'>ID: {bot.telegramId}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border',
              bot.active
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'text-muted-foreground bg-muted/40'
            )}
          >
            <span
              className={cn(
                'size-1.5 rounded-full',
                bot.active ? 'bg-emerald-500' : 'bg-muted-foreground/50'
              )}
            />
            {bot.active ? 'Aktif' : 'Nonaktif'}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border',
              bot.roleColor
            )}
          >
            {bot.roleLabel}
          </span>
        </div>

        <div className='flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground self-start'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-3'
          >
            <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
          {bot.groups > 0 ? (
            <>
              <span className='font-medium text-foreground tabular-nums'>{bot.groups}</span> grup
            </>
          ) : (
            'Belum ada grup'
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardMock() {
  return (
    <div className='overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lg ring-1 ring-border/40 animate-fade-up'>
      {/* Browser title bar */}
      <div className='flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5'>
        <div className='flex items-center gap-1.5'>
          <span className='size-2.5 rounded-full bg-red-400' />
          <span className='size-2.5 rounded-full bg-amber-400' />
          <span className='size-2.5 rounded-full bg-emerald-400' />
        </div>
        <div className='mx-auto flex items-center gap-2 rounded-md bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-3'
          >
            <rect x='3' y='3' width='18' height='18' rx='2' />
            <circle cx='8' cy='8' r='2' />
            <path d='m21 15-3.09-3.09a2 2 0 0 0-2.82 0L7 20' />
          </svg>
          urator.com/dashboard
        </div>
        <div className='flex items-center gap-3'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-3.5 text-muted-foreground/60'
          >
            <path d='M12 3a6 6 0 0 0-6 6c0 3 2 5 2 5h8s2-2 2-5a6 6 0 0 0-6-6Z' />
            <path d='M8 14s0 3 4 3 4-3 4-3' />
          </svg>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-3.5 text-muted-foreground/60'
          >
            <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
          </svg>
          <div className='size-5 rounded-full bg-primary/20 flex items-center justify-center'>
            <span className='text-[10px] font-medium text-primary'>A</span>
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className='p-4 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-foreground'>Overview</h3>
            <p className='text-[11px] text-muted-foreground'>Pantau performa bisnis Anda</p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='hidden sm:flex items-center rounded-md border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground gap-1.5'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-3'
              >
                <circle cx='11' cy='11' r='8' />
                <path d='m21 21-4.3-4.3' />
              </svg>
              Cari...
            </div>
            <div className='size-7 rounded-md bg-muted flex items-center justify-center'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-3.5 text-muted-foreground'
              >
                <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
                <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0' />
              </svg>
            </div>
            <div className='size-7 rounded-md bg-primary/10 flex items-center justify-center'>
              <span className='text-[11px] font-medium text-primary'>A</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-4 gap-2.5'>
          {MOCK_STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Bot cards */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-xs font-semibold text-foreground'>Bot Telegram</h4>
            <span className='text-[11px] text-primary font-medium'>Lihat Semua →</span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
            {MOCK_BOTS.map((bot) => (
              <MockBotCard key={bot.username} bot={bot} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
