'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { TelegramBot } from '../../api/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import { CellAction } from './cell-action';

const BOT_ROLE_LABELS: Record<string, string> = {
  sales_only: 'Sales Only',
  gatekeeper_only: 'Gatekeeper',
  all_in_one: 'All-in-One'
};

export function getColumns(
  onEdit: (bot: TelegramBot) => void
): ColumnDef<TelegramBot>[] {
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
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'
              )}
            >
              <Icons.bot width={20} height={20} className='text-primary' />
            </div>
            <div>
              <h6 className='text-sm font-semibold'>@{bot.username}</h6>
              <p className='text-xs text-muted-foreground'>
                ID: {bot.telegram_bot_id}
              </p>
            </div>
          </div>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: 'Bot',
        placeholder: 'Search bots...',
        variant: 'text',
        icon: Icons.search
      }
    },
    {
      id: 'bot_role',
      accessorKey: 'bot_role',
      enableSorting: false,
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
      cell: ({ cell }) => {
        const role = cell.getValue<TelegramBot['bot_role']>();
        return (
          <Badge 
            variant='outline' 
            className='capitalize'
          >
            {BOT_ROLE_LABELS[role] ?? role}
          </Badge>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: 'Role',
        variant: 'multiSelect',
        options: [
          { label: 'Sales Only', value: 'sales_only' },
          { label: 'Gatekeeper', value: 'gatekeeper_only' },
          { label: 'All-in-One', value: 'all_in_one' }
        ]
      }
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      enableSorting: false,
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
              isActive
                ? 'bg-primary/10 text-primary border-transparent'
                : 'text-muted-foreground'
            )}
          >
            <StatusIcon className='size-3' />
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }: { column: Column<TelegramBot, unknown> }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatDate(row.original.created_at, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
