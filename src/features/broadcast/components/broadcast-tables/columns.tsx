'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Broadcast } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
  },
  processing: {
    label: 'Diproses',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400'
  },
  completed: {
    label: 'Selesai',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
  },
  scheduled: {
    label: 'Terjadwal',
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400'
  }
};

const targetLabels: Record<string, string> = {
  group: 'Grup',
  member: 'Member'
};

const typeLabels: Record<string, string> = {
  text: 'Teks',
  photo: 'Foto',
  document: 'Dokumen'
};

export const columns: ColumnDef<Broadcast>[] = [
  {
    id: 'target_type',
    accessorKey: 'target_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tujuan' />,
    cell: ({ cell }) => (
      <Badge variant='outline' className='capitalize'>
        {targetLabels[cell.getValue<string>()] ?? cell.getValue<string>()}
      </Badge>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'Tujuan' }
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
    enableColumnFilter: false,
    meta: { label: 'Tipe' }
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
    enableColumnFilter: false,
    meta: { label: 'Pesan' }
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
    enableColumnFilter: false,
    meta: { label: 'Status' }
  },
  {
    id: 'progress',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Progres' />,
    cell: ({ row }) => {
      const { sent_count, failed_count, total_targets, status } = row.original;
      if (status === 'scheduled') return <span className='text-sm text-muted-foreground'>-</span>;
      const processedCount = sent_count + failed_count;
      const progressValue = total_targets > 0 ? (processedCount / total_targets) * 100 : 0;
      return (
        <div className='min-w-[180px] space-y-1.5'>
          <div className='flex items-center justify-between gap-2 text-sm'>
            <span className='tabular-nums text-muted-foreground'>
              {processedCount}/{total_targets}
            </span>
            <span className='tabular-nums text-muted-foreground'>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} />
          {failed_count > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type='button'
                  className='text-xs text-destructive hover:underline cursor-pointer'
                >
                  ({failed_count} gagal)
                </button>
              </PopoverTrigger>
              <PopoverContent className='w-80 p-0' align='start'>
                <div className='px-4 py-3 border-b border-border'>
                  <p className='text-sm font-semibold'>Gagal: {failed_count} penerima</p>
                </div>
                <div className='max-h-[240px] overflow-y-auto'>
                  {row.original.failed_details?.map((d, i) => (
                    <div
                      key={i}
                      className='flex items-start gap-2 px-4 py-2 text-sm border-b border-border last:border-0'
                    >
                      <Icons.circleX className='mt-0.5 size-3.5 shrink-0 text-destructive' />
                      <div className='min-w-0'>
                        <p className='font-mono text-xs text-muted-foreground truncate'>
                          {d.chat_id}
                        </p>
                        <p className='text-xs'>{d.error}</p>
                      </div>
                    </div>
                  ))}
                  {!row.original.failed_details?.length && (
                    <p className='px-4 py-2 text-xs text-muted-foreground'>Detail tidak tersedia</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'Progres' }
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
    enableColumnFilter: false,
    meta: { label: 'Jadwal' }
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
    enableColumnFilter: false,
    meta: { label: 'Dibuat' }
  }
];
