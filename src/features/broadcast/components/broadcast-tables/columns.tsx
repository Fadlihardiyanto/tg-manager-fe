'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Broadcast } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent'
  },
  processing: {
    label: 'Diproses',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-transparent'
  },
  completed: {
    label: 'Selesai',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent'
  },
  scheduled: {
    label: 'Terjadwal',
    className:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-transparent'
  }
};

const targetLabels: Record<string, string> = {
  group: 'Group',
  member: 'Member'
};

const typeLabels: Record<string, string> = {
  text: 'Text',
  photo: 'Photo',
  document: 'Document'
};

export const columns: ColumnDef<Broadcast>[] = [
  {
    id: 'target_type',
    accessorKey: 'target_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Target' />,
    cell: ({ cell }) => (
      <Badge variant='outline' className='capitalize'>
        {targetLabels[cell.getValue<string>()] ?? cell.getValue<string>()}
      </Badge>
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'message_type',
    accessorKey: 'message_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tipe' />,
    cell: ({ cell }) => (
      <span className='capitalize text-muted-foreground'>
        {typeLabels[cell.getValue<string>()] ?? cell.getValue<string>()}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'message_text',
    accessorKey: 'message_text',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Pesan' />,
    cell: ({ cell }) => {
      const text = cell.getValue<string>();
      return (
        <div className='max-w-[300px] truncate text-sm' title={text.replace(/<[^>]*>/g, '')}>
          {text.replace(/<[^>]*>/g, '')}
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ cell }) => {
      const status = cell.getValue<string>();
      const config = statusConfig[status] ?? {
        label: status,
        className: ''
      };
      return (
        <Badge variant='outline' className={cn(config.className)}>
          {status === 'processing' && <Icons.spinner className='mr-1 h-3 w-3 animate-spin' />}
          {config.label}
        </Badge>
      );
    },
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'progress',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Progress' />,
    cell: ({ row }) => {
      const { sent_count, failed_count, total_targets, status } = row.original;
      if (status === 'scheduled') return <span className='text-sm text-muted-foreground'>—</span>;
      if (total_targets === 0) return <span className='text-sm text-muted-foreground'>0</span>;
      return (
        <div className='flex items-center gap-2'>
          <span className='text-sm tabular-nums text-muted-foreground'>
            {sent_count + failed_count}/{total_targets}
          </span>
          {failed_count > 0 && (
            <span className='text-xs text-destructive'>({failed_count} gagal)</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'scheduled_at',
    accessorKey: 'scheduled_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Jadwal Eksekusi' />,
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      if (!date) return <span className='text-sm text-muted-foreground'>Langsung</span>;
      return (
        <span className='text-sm text-muted-foreground'>
          {formatDate(date, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: false
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Dibuat' />,
    cell: ({ cell }) => {
      const date = cell.getValue<string>();
      return (
        <span className='text-sm text-muted-foreground'>
          {formatDate(date, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: false
  }
];
