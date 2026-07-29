'use client';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import type { TelegramGroup } from '@/features/groups/api/types';

interface BotGroupListProps {
  groups: TelegramGroup[];
  onGroupClick: (group: TelegramGroup) => void;
}

export function BotTreeViz({ groups, onGroupClick }: BotGroupListProps) {
  if (groups.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
          <Icons.groups className='size-6 text-muted-foreground' />
        </div>
        <p className='mt-3 text-sm font-medium text-foreground'>Belum ada grup terhubung</p>
        <p className='mt-1 text-xs text-muted-foreground'>
          Klik &quot;Hubungkan Grup&quot; di atas untuk menambahkan grup ke bot ini.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4 flex items-center gap-2'>
        <Icons.groups className='size-4 text-muted-foreground' />
        <h3 className='text-sm font-semibold'>Grup Terhubung ({groups.length})</h3>
      </div>

      <div className='flex flex-wrap justify-center gap-4'>
        {groups.map((group) => (
          <button
            key={group.id}
            type='button'
            onClick={() => onGroupClick(group)}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-card px-4 py-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
              group.is_active ? '' : 'opacity-60'
            )}
          >
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                group.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icons.groups className='size-5' />
            </div>
            <span className='max-w-[140px] truncate text-sm font-medium'>{group.name}</span>
            <span className='text-xs text-muted-foreground tabular-nums'>
              {group.member_count} anggota
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
