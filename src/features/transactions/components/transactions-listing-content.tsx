'use client';

import { Suspense } from 'react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TransactionsTable } from './transactions-table';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'settled', label: 'Selesai' },
  { value: 'success', label: 'Berhasil' },
  { value: 'failed', label: 'Gagal' },
  { value: 'expired', label: 'Kedaluwarsa' }
];

export function TransactionsListingContent() {
  const [status, setStatus] = useQueryState('status', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const handleStatusChange = (v: string) => {
    setStatus(v === 'all' ? null : v);
    if (page !== 1) void setPage(1);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-4 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-end gap-4'>
          <div className='space-y-1'>
            <Label>Status</Label>
            <Select value={status ?? 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-full rounded-full sm:w-[250px]'>
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
          </div>
        </div>
      </div>

      <Suspense fallback={<Skeleton className='h-64 w-full' />}>
        <TransactionsTable status={status} />
      </Suspense>
    </div>
  );
}
