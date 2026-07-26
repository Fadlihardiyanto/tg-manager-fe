'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { TelegramGroup } from '../../api/types';
import { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

const roleLabels: Record<string, string> = {
  sales_only: 'Penjualan',
  gatekeeper_only: 'Penjaga',
  all_in_one: 'Semua dalam Satu'
};

export function getColumns(onEdit?: (group: TelegramGroup) => void): ColumnDef<TelegramGroup>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Grup' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-violet-500/5 ring-1 ring-violet-500/20'>
            <Icons.teams className='size-4 text-violet-600 dark:text-violet-400' />
          </div>
          <span className='font-semibold'>{row.getValue('name')}</span>
        </div>
      ),
      meta: {
        label: 'Nama Grup',
        placeholder: 'Cari grup...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'bot',
      accessorKey: 'bot_username',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Bot' />,
      cell: ({ row }) => {
        const username = row.original.bot_username;
        const role = row.original.bot_role;
        if (!username) return <span className='text-sm text-muted-foreground'>—</span>;
        return (
          <div className='flex flex-col'>
            <span className='font-mono text-sm'>@{username}</span>
            {role && (
              <span className='text-xs text-muted-foreground'>{roleLabels[role] ?? role}</span>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'telegram_chat_id',
      accessorKey: 'telegram_chat_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID Chat' />,
      cell: ({ cell }) => (
        <span className='font-mono text-sm text-muted-foreground'>{cell.getValue<number>()}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'member_count',
      accessorKey: 'member_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Member' />,
      cell: ({ cell }) => {
        const count = cell.getValue<number>();
        return (
          <Badge
            variant='secondary'
            className={cn(
              'font-semibold tabular-nums',
              count >= 100
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                : count >= 50
                  ? 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400'
                  : ''
            )}
          >
            {count}
          </Badge>
        );
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ cell }) => {
        const isActive = cell.getValue<boolean>();
        const Icon = isActive ? Icons.circleCheck : Icons.xCircle;
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
            <Icon className='size-3' />
            {isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'inactive_reason',
      accessorKey: 'inactive_reason',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Alasan Nonaktif' />,
      cell: ({ cell, row }) => {
        const isActive = row.original.is_active;
        const reason = cell.getValue<string | null>();
        if (isActive || !reason) return null;
        return <span className='text-sm text-destructive'>{reason}</span>;
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Dibuat' />,
      cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return (
          <span className='text-muted-foreground text-sm'>
            {formatDate(date, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
