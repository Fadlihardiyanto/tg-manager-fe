'use client';

import { Progress } from '@/components/ui/progress';
import { useActivePlan } from './active-plan-provider';

interface QuotaCardProps {
  resource: 'bots' | 'packages' | 'custom_commands' | 'broadcasts';
  title: string;
}

export function QuotaCard({ resource, title }: QuotaCardProps) {
  const { getQuota, isLoading } = useActivePlan();

  if (isLoading) return null;

  const quota = getQuota(resource);
  if (!quota) return null;

  return (
    <div className='rounded-lg border bg-card p-4'>
      <div className='mb-2 flex items-center justify-between gap-3 text-sm'>
        <span className='font-medium'>{title}</span>
        <span className='tabular-nums text-muted-foreground'>
          {quota.used} / {quota.isUnlimited ? 'unlimited' : quota.limit}
        </span>
      </div>
      {!quota.isUnlimited && <Progress value={quota.percentage} />}
      {!quota.hasQuota && (
        <p className='mt-2 text-xs font-medium text-destructive'>
          Quota penuh. Upgrade plan untuk menambah limit.
        </p>
      )}
    </div>
  );
}
