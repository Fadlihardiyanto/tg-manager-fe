'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import { Icons } from '@/components/icons';
import { transactionsQueryOptions } from '../../api/queries';
import { columns } from './columns';

interface TransactionsTableProps {
  status: string | null;
}

export function TransactionsTable({ status }: TransactionsTableProps) {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const filters = { page, limit: perPage, status: status ?? undefined };

  const { data, isError, isLoading } = useQuery(transactionsQueryOptions(filters));
  const items = data?.data ?? [];
  const pageCount = data?.meta?.total_pages ?? 1;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: [] }
    }
  });

  return (
    <DataTable
      table={table}
      title='Data Transaksi'
      description='Transaksi pembelian paket oleh member.'
      notice={
        isLoading && !data ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>Memuat...</p>
        ) : undefined
      }
      emptyState={
        <div className='flex flex-col items-center gap-3 py-6'>
          <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Icons.coin className='size-7' />
          </div>
          <div className='text-center'>
            <p className='font-semibold text-foreground'>Belum ada transaksi</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Transaksi pembelian paket oleh member akan tampil di sini.
            </p>
          </div>
        </div>
      }
    >
      {isError && <p className='text-sm text-destructive'>Gagal memuat data transaksi.</p>}
    </DataTable>
  );
}
