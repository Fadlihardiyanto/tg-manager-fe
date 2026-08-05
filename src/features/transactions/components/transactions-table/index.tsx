'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { useDataTable } from '@/hooks/use-data-table';
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
    >
      {isError && <p className='text-sm text-destructive'>Gagal memuat data transaksi.</p>}
    </DataTable>
  );
}
