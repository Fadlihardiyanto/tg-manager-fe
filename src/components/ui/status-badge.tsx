'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  active,
  activeLabel = 'Aktif',
  inactiveLabel = 'Nonaktif'
}: StatusBadgeProps) {
  return (
    <Badge
      variant='outline'
      className={
        active
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
          : 'bg-muted text-muted-foreground border-border'
      }
    >
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
