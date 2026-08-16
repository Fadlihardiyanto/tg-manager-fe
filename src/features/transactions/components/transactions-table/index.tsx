'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { transactionsQueryOptions } from '../../api/queries';
import { columns } from './columns';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Lunas' },
  { value: 'failed', label: 'Gagal' },
  { value: 'expired', label: 'Kedaluwarsa' }
];

interface TransactionsTableProps {
  status: string | null;
  onStatusChange: (status: string | null) => void;
}

export function TransactionsTable({ status, onStatusChange }: TransactionsTableProps) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withOptions({ shallow: true, history: 'replace', clearOnDefault: true })
  );
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    void setSearch(value || null);
    if (page !== 1) void setPage(1);
  }, 400);

  const filters = {
    page,
    limit: perPage,
    status: status ?? undefined,
    search: search ?? undefined
  };

  const { data, isError, isLoading } = useQuery({
    ...transactionsQueryOptions(filters),
    placeholderData: (previous) => previous
  });
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

  if (isLoading && !data) {
    return <TransactionsSkeleton />;
  }

  return (
    <DataTable
      table={table}
      title='Data Transaksi'
      description='Transaksi pembelian paket oleh member.'
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
      <DataTableToolbar table={table}>
        <Input
          value={search ?? ''}
          onChange={(e) => debouncedSetSearch(e.target.value)}
          placeholder='Cari member atau ID transaksi...'
          className='h-10 w-full rounded-full border-border bg-background px-4 text-sm font-semibold sm:w-60'
        />
        <Select
          value={status ?? 'all'}
          onValueChange={(v) => onStatusChange(v === 'all' ? null : v)}
        >
          <SelectTrigger className='h-10 w-full rounded-full border-border font-semibold sm:w-[180px]'>
            <SelectValue placeholder='Semua status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Semua status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataTableToolbar>
      {isError && <p className='text-sm text-destructive'>Gagal memuat data transaksi.</p>}
    </DataTable>
  );
}

function TransactionsSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-3.5 w-64' />
        </div>
        <Skeleton className='h-10 w-40 rounded-full' />
      </div>
      <div className='rounded-xl border border-border/70 bg-background p-4'>
        <div className='flex items-center gap-4 border-b pb-3'>
          {[28, 32, 24, 32, 40, 20].map((w, i) => (
            <Skeleton key={i} className='h-3.5' style={{ width: `${w * 4}px` }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className='flex items-center gap-4 border-b py-4 last:border-0'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-32 font-mono' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        ))}
      </div>
    </div>
  );
}
