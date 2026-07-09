'use client';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { formatDate, formatRupiah } from '@/lib/format';
import { billingHistoryQueryOptions } from '../api/queries';
import type { BillingCycle, BillingHistoryItem, BillingStatus } from '../api/types';

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

  if (item.status === 'pending' && item.payment_url) {
    return (
      <Button asChild size='sm'>
        <a href={item.payment_url} target='_blank' rel='noreferrer'>
          <Icons.externalLink className='h-4 w-4' />
          Selesaikan Pembayaran
        </a>
      </Button>
    );
  }

  return <span className='text-muted-foreground text-sm'>-</span>;
}

export function BillingHistoryTab() {
  const [page, setPage] = useQueryState(
    'history_page',
    parseAsInteger.withDefault(1).withOptions({ history: 'replace' })
  );
  const limit = 10;

  const query = useQuery({
    ...billingHistoryQueryOptions({ page, limit }),
    placeholderData: (previous) => previous
  });

  const items = query.data?.data ?? [];
  const meta = query.data?.meta;
  const canPrev = page > 1;
  const canNext = page < (meta?.total_pages ?? 1);

  return (
    <div className='space-y-4'>
      {query.data?.success === false ? (
        <Alert variant='warning'>
          <Icons.warning />
          <AlertTitle>Riwayat pembayaran belum bisa dimuat</AlertTitle>
          <AlertDescription>{query.data.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className='rounded-xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Paket & Siklus</TableHead>
              <TableHead>Total Bayar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <div className='bg-muted h-10 animate-pulse rounded' />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.created_at || item.started_at)}</TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <p className='font-medium'>{item.plan.display_name}</p>
                      <p className='text-muted-foreground text-sm'>
                        {formatBillingCycle(item.billing_cycle)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.amount ? formatRupiah(Number(item.amount)) : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {formatBillingStatus(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>{getHistoryAction(item)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground py-10 text-center'>
                  Belum ada riwayat pembayaran.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-muted-foreground text-sm'>
          {meta
            ? `Menampilkan halaman ${meta.page} dari ${Math.max(meta.total_pages, 1)}`
            : 'Riwayat pembayaran tenant'}
        </p>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={!canPrev}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={!canNext}
            onClick={() => setPage(page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
