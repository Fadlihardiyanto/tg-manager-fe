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
        <div className='flex items-center gap-2'>
          <Icons.teams className='size-4 text-muted-foreground' />
          <span className='font-medium'>{row.getValue('name')}</span>
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
      cell: ({ cell }) => <Badge variant='secondary'>{cell.getValue<number>()}</Badge>,
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
              isActive ? 'bg-primary/10 text-primary border-transparent' : 'text-muted-foreground'
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
            {formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' })}
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
