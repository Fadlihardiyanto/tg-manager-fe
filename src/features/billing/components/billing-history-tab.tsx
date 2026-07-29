'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';
import type { ColumnDef } from '@tanstack/react-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { MidtransSnapCheckout } from '@/components/payments/midtrans-snap-checkout';
import { useDataTable } from '@/hooks/use-data-table';
import { formatDate, formatRupiah } from '@/lib/format';
import { billingHistoryQueryOptions } from '../api/queries';
import type { BillingCycle, BillingHistoryItem, BillingStatus } from '../api/types';
import { CancelPendingBillingButton } from './cancel-pending-billing-button';

function formatBillingCycle(cycle?: BillingCycle) {
  if (cycle === 'monthly') return 'Bulanan';
  if (cycle === 'yearly') return 'Tahunan';
  return '-';
}

function formatBillingStatus(status?: BillingStatus) {
  if (status === 'active') return 'Aktif';
  if (status === 'pending') return 'Menunggu Pembayaran';
  if (status === 'upgraded') return 'Telah Di-upgrade';
  if (status === 'cancelled') return 'Dibatalkan';
  if (status === 'expired') return 'Kedaluwarsa';
  if (status === 'past_due') return 'Lewat Jatuh Tempo';
  if (status === 'failed') return 'Gagal';
  return status || '-';
}

function getStatusVariant(status?: BillingStatus): 'secondary' | 'outline' | 'destructive' {
  if (status === 'active' || status === 'upgraded') return 'secondary';
  if (status === 'pending' || status === 'past_due') return 'outline';
  return 'destructive';
}

function getHistoryAction(item: BillingHistoryItem) {
  if ((item.status === 'active' || item.status === 'upgraded') && item.receipt_url) {
    return (
      <Button asChild size='sm' variant='outline'>
        <a href={item.receipt_url} target='_blank' rel='noreferrer'>
          <Icons.fileTypePdf className='h-4 w-4' />
          Unduh Kuitansi
        </a>
      </Button>
    );
  }

  if (item.status === 'pending' && (item.snap_token || item.payment_url)) {
    return (
      <div className='flex flex-wrap justify-end gap-2'>
        <MidtransSnapCheckout
          snapToken={item.snap_token}
          paymentUrl={item.payment_url}
          clientKey={item.client_key}
          orderId={item.order_id || item.id}
          successRedirectUrl='/dashboard/billing/checkout-result'
          fallbackLabel='Selesaikan Pembayaran'
          size='sm'
        >
          Selesaikan Pembayaran
        </MidtransSnapCheckout>
        <CancelPendingBillingButton size='sm' />
      </div>
    );
  }

  return <span className='text-muted-foreground text-sm'>-</span>;
}

export function BillingHistoryTab() {
  const [params] = useQueryStates({
    history_page: parseAsInteger.withDefault(1),
    history_perPage: parseAsInteger.withDefault(10)
  });

  const query = useQuery({
    ...billingHistoryQueryOptions({
      page: params.history_page,
      limit: params.history_perPage
    }),
    placeholderData: (previous) => previous
  });

  const { data, isLoading, isError } = query;
  const items = data?.data ?? [];
  const meta = data?.meta;
  const pageCount = Math.max(meta?.total_pages ?? 1, 1);
  const columns = useMemo<ColumnDef<BillingHistoryItem>[]>(
    () => [
      {
        id: 'date',
        accessorFn: (row) => row.created_at || row.started_at,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tanggal' />,
        cell: ({ row }) => formatDate(row.original.created_at || row.original.started_at)
      },
      {
        id: 'plan',
        accessorFn: (row) => row.plan.display_name,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paket & Siklus' />,
        cell: ({ row }) => (
          <div className='space-y-1'>
            <p className='font-medium'>{row.original.plan.display_name}</p>
            <p className='text-muted-foreground text-sm'>
              {formatBillingCycle(row.original.billing_cycle)}
            </p>
          </div>
        )
      },
      {
        id: 'amount',
        accessorFn: (row) => Number(row.amount ?? 0),
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Bayar' />,
        cell: ({ row }) => (row.original.amount ? formatRupiah(Number(row.original.amount)) : '-')
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => (
          <Badge variant={getStatusVariant(row.original.status)}>
            {formatBillingStatus(row.original.status)}
          </Badge>
        )
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => <div className='flex justify-end'>{getHistoryAction(row.original)}</div>,
        enableSorting: false
      }
    ],
    []
  );

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    queryStateKeys: {
      page: 'history_page',
      perPage: 'history_perPage',
      sort: 'history_sort'
    },
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {isError ? (
        <Alert variant='destructive'>
          <Icons.warning />
          <AlertTitle>Gagal memuat riwayat pembayaran</AlertTitle>
          <AlertDescription>Jaringan bermasalah atau server tidak tersedia.</AlertDescription>
        </Alert>
      ) : data?.success === false ? (
        <Alert variant='warning'>
          <Icons.warning />
          <AlertTitle>Riwayat pembayaran belum bisa dimuat</AlertTitle>
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        table={table}
        title='Riwayat Pembayaran'
        description='Daftar transaksi penagihan tenant, termasuk kuitansi dan pembayaran yang masih menunggu.'
        notice={
          isLoading && !data ? (
            <div className='flex items-center justify-center py-6'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                    opacity='0.25'
                  />
                  <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='4' fill='none' />
                </svg>
                Memuat...
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
