'use client';

import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useActivePlan } from './active-plan-provider';

interface QuotaCardProps {
  resource: 'bots' | 'packages' | 'custom_commands' | 'broadcasts';
  title: string;
  className?: string;
}

export function QuotaCard({ resource, title, className }: QuotaCardProps) {
  const { getQuota, isLoading } = useActivePlan();

  if (isLoading) return null;

  const quota = getQuota(resource);
  if (!quota || quota.isUnlimited || quota.hasQuota) return null;

  const slotLabel = title.toLowerCase().replace(/^kuota\s+/, 'slot ');

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex items-center gap-3'>
        <Icons.info className='size-5 shrink-0 text-primary' />
        <span className='text-foreground'>
          Anda telah menggunakan{' '}
          <span className='font-bold text-primary tabular-nums'>{quota.used}</span> dari{' '}
          <span className='font-bold text-primary tabular-nums'>{quota.limit}</span> {slotLabel}.
        </span>
      </div>
      <Button
        asChild
        variant='ghost'
        size='sm'
        className='self-start rounded-full text-xs font-bold tracking-wider uppercase sm:self-center'
      >
        <Link href='/dashboard/billing?tab=upgrade'>Upgrade Plan</Link>
      </Button>
    </div>
  );
}
