'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { TelegramBot, BotRole } from '../../api/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { BOT_ROLE_LABELS, BOT_ROLE_OPTIONS } from '../../api/types';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { CellAction } from './cell-action';

const BOT_ROLE_STYLES: Record<BotRole, string> = {
  sales_only: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  gatekeeper_only: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
  all_in_one: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
};

export function getColumns(onEdit: (bot: TelegramBot) => void): ColumnDef<TelegramBot>[] {
  return [
    {
      id: 'username',
      accessorKey: 'username',
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Bot' />
      ),
      cell: ({ row }) => {
        const bot = row.original;
        return (
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
                  bot.is_active
                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'
                    : 'bg-muted'
                )}
              >
                <Icons.bot
                  width={20}
                  height={20}
                  className={cn(bot.is_active ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
              {/* Connection status indicator */}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background',
                  bot.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                )}
              />
            </div>
            <div>
              <h6 className='text-sm font-semibold'>@{bot.username}</h6>
              <p className='text-xs text-muted-foreground'>ID: {bot.telegram_bot_id}</p>
            </div>
          </div>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: 'Bot',
        placeholder: 'Cari bot...',
        variant: 'text',
        icon: Icons.search
      }
    },
    {
      id: 'bot_role',
      accessorKey: 'bot_role',
      enableSorting: false,
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Peran' />
      ),
      cell: ({ cell }) => {
        const role = cell.getValue<TelegramBot['bot_role']>();
        return (
          <Badge
            variant='outline'
            className={cn('capitalize font-medium', BOT_ROLE_STYLES[role] ?? '')}
          >
            {BOT_ROLE_LABELS[role] ?? role}
          </Badge>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: 'Peran',
        variant: 'multiSelect',
        options: BOT_ROLE_OPTIONS
      }
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      enableSorting: false,
      meta: { label: 'Status' },
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        const StatusIcon = isActive ? Icons.circleCheck : Icons.xCircle;

        return (
          <Badge
            variant={isActive ? 'default' : 'outline'}
            className={cn(
              'gap-1.5 font-medium transition-all',
              isActive
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15 dark:text-emerald-400'
                : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            <StatusIcon className='size-3' />
            {isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        );
      }
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Dibuat' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatDate(row.original.created_at, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      ),
      meta: { label: 'Dibuat' }
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
