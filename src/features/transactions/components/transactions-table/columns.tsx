'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Transaction, TransactionStatus } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-transparent'
  },
  settled: {
    label: 'Selesai',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent'
  },
  success: {
    label: 'Berhasil',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent'
  },
  failed: {
    label: 'Gagal',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-transparent'
  },
  expired: {
    label: 'Kedaluwarsa',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-transparent'
  }
};

function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status] ?? {
    label: status || '-',
    className: ''
  };
  return (
    <Badge variant='outline' className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

function MemberCell({ transaction }: { transaction: Transaction }) {
  return (
    <div className='space-y-0.5'>
      <p className='font-medium'>{transaction.member_name || '-'}</p>
      {transaction.member_username && (
        <p className='text-sm text-muted-foreground'>@{transaction.member_username}</p>
      )}
    </div>
  );
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tanggal' />,
    cell: ({ row }) =>
      formatDate(row.original.created_at, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    enableSorting: true,
    enableColumnFilter: false,
    meta: { label: 'Tanggal' }
  },
  {
    id: 'member',
    accessorFn: (row) => row.member_name,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Member' />,
    cell: ({ row }) => <MemberCell transaction={row.original} />,
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'Member' }
  },
  {
    id: 'package_name',
    accessorKey: 'package_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Paket' />,
    cell: ({ row }) => row.original.package_name || '-',
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'Paket' }
  },
  {
    id: 'amount',
    accessorFn: (row) => Number(row.amount ?? 0),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Total Bayar' />,
    cell: ({ row }) => (row.original.amount ? formatRupiah(Number(row.original.amount)) : '-'),
    enableSorting: true,
    enableColumnFilter: false,
    meta: { label: 'Total Bayar' }
  },
  {
    id: 'external_id',
    accessorKey: 'external_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title='ID Transaksi' />,
    cell: ({ row }) => (
      <span className='font-mono text-xs text-muted-foreground'>
        {row.original.external_id || '-'}
      </span>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'ID Transaksi' }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'Status' }
  }
];
