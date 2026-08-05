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
  gatekeeper_only: 'Penjaga Akses',
  all_in_one: 'Multi-fungsi'
};

export function getColumns(onEdit?: (group: TelegramGroup) => void): ColumnDef<TelegramGroup>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama Grup' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'>
            <Icons.teams className='size-4 text-primary' />
          </div>
          <span className='max-w-[200px] truncate font-semibold'>{row.getValue('name')}</span>
        </div>
      ),
      meta: {
        label: 'Nama Grup',
        placeholder: 'Cari grup...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true,
      enableSorting: true,
      size: 220
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
      enableColumnFilter: false,
      meta: { label: 'Bot' },
      size: 130
    },
    {
      id: 'telegram_chat_id',
      accessorKey: 'telegram_chat_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID Chat' />,
      cell: ({ cell }) => (
        <span className='font-mono text-sm text-muted-foreground'>{cell.getValue<number>()}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: { label: 'ID Chat' },
      enableHiding: true,
      size: 120
    },
    {
      id: 'member_count',
      accessorKey: 'member_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Member' />,
      cell: ({ cell }) => {
        const count = cell.getValue<number>();
        const label = count >= 100 ? 'grup besar' : count >= 50 ? 'grup menengah' : '';
        return (
          <Badge
            variant='secondary'
            className={cn(
              'font-semibold tabular-nums gap-1',
              count >= 100
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                : count >= 50
                  ? 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400'
                  : ''
            )}
          >
            {count}
            {label && <span className='text-[10px] font-normal opacity-70 ml-0.5'>{label}</span>}
          </Badge>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
      meta: { label: 'Member' },
      size: 110
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ cell, row }) => {
        const isActive = cell.getValue<boolean>();
        const Icon = isActive ? Icons.circleCheck : Icons.xCircle;
        const reason = !isActive ? row.original.inactive_reason : null;
        return (
          <div className='flex flex-col items-start gap-0.5'>
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
            {reason && (
              <span className='text-[11px] text-destructive truncate max-w-[140px]'>{reason}</span>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) return true;
        const value = row.getValue<boolean>(columnId);
        return filterValue.includes(value ? 'true' : 'false');
      },
      meta: {
        label: 'Status',
        variant: 'multiSelect' as const,
        options: [
          { label: 'Aktif', value: 'true' },
          { label: 'Nonaktif', value: 'false' }
        ]
      },
      size: 100
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
      enableColumnFilter: false,
      meta: { label: 'Dibuat' },
      enableHiding: true,
      size: 110
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />,
      size: 50
    }
  ];
}
