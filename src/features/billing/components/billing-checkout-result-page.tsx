'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { MidtransSnapCheckout } from '@/components/payments/midtrans-snap-checkout';
import { formatDate, formatRupiah } from '@/lib/format';
import { activeBillingQueryOptions, billingHistoryQueryOptions } from '../api/queries';
import type { ActiveBilling, BillingCycle } from '../api/types';
import { CancelPendingBillingButton } from './cancel-pending-billing-button';

const MAX_AUTO_REFETCH = 4;

function formatBillingCycle(cycle?: BillingCycle) {
  if (cycle === 'monthly') return 'Bulanan';
  if (cycle === 'yearly') return 'Tahunan';
  return '-';
}

function formatStatus(status?: string) {
  if (!status) return '-';
  if (status === 'active') return 'Aktif';
  if (status === 'pending') return 'Menunggu Pembayaran';
  if (status === 'expired') return 'Kedaluwarsa';
  if (status === 'failed') return 'Gagal';
  return status;
}

function getCheckoutResultState(
  billing: ActiveBilling | null,
  isLoading: boolean,
  isAutoPolling: boolean
) {
  if (isLoading) return 'processing' as const;
  if (!billing) return 'failed' as const;
  if (billing.status === 'active') return 'success' as const;
  if (billing.status === 'pending')
    return isAutoPolling ? ('processing' as const) : ('pending' as const);
  return 'failed' as const;
}

export function BillingCheckoutResultPage() {
  const [pollCount, setPollCount] = useState(0);
  const query = useQuery({
    ...activeBillingQueryOptions(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: (queryState) => {
      const billing = queryState.state.data?.success ? queryState.state.data.data : null;
      const status = billing?.status;
      const isTerminal = status === 'active' || status === 'expired' || status === 'failed';

      return isTerminal || pollCount >= MAX_AUTO_REFETCH ? false : 3000;
    }
  });
  const pendingPaymentQuery = useQuery({
    ...billingHistoryQueryOptions({ page: 1, limit: 5 }),
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const billing = query.data?.success ? query.data.data : null;
  const pendingPayment = pendingPaymentQuery.data?.data?.find((item) => {
    if (item.status !== 'pending' || (!item.snap_token && !item.payment_url)) return false;
    if (!billing || billing.status !== 'active') return true;

    const pendingTime = Date.parse(item.created_at || item.started_at);
    const activeTime = Date.parse(billing.paid_at || billing.started_at);

    return Number.isFinite(pendingTime) && Number.isFinite(activeTime) && pendingTime > activeTime;
  });
  const status = billing?.status;
  const isTerminal = status === 'active' || status === 'expired' || status === 'failed';

  useEffect(() => {
    if (!query.dataUpdatedAt || isTerminal || pollCount >= MAX_AUTO_REFETCH) return;
    setPollCount((current) => current + 1);
  }, [isTerminal, pollCount, query.dataUpdatedAt]);

  const resultState = getCheckoutResultState(
    billing,
    query.isLoading || query.isFetching,
    !isTerminal && pollCount < MAX_AUTO_REFETCH
  );

  return (
    <Card className='mx-auto max-w-3xl'>
      <CardHeader>
        <div className='flex flex-wrap items-center gap-2'>
          <CardTitle>Hasil Checkout Billing</CardTitle>
          <Badge variant='outline'>{formatStatus(billing?.status)}</Badge>
        </div>
        <CardDescription>
          Halaman ini memverifikasi status billing terbaru dari backend setelah Anda kembali dari
          Midtrans.
        </CardDescription>
      </CardHeader>

      {resultState === 'processing' && (
        <CardContent className='space-y-4'>
          <Alert>
            <Icons.spinner className='h-4 w-4 animate-spin' />
            <AlertTitle>Sedang memverifikasi pembayaran</AlertTitle>
            <AlertDescription>
              Kami sedang mengecek status billing terbaru. Jika webhook belum selesai diproses,
              status akan diperbarui otomatis sebentar lagi.
            </AlertDescription>
          </Alert>

          {pendingPayment && (
            <div className='flex flex-wrap gap-2'>
              <MidtransSnapCheckout
                snapToken={pendingPayment.snap_token}
                paymentUrl={pendingPayment.payment_url}
                clientKey={pendingPayment.client_key}
                orderId={pendingPayment.order_id || pendingPayment.id}
                successRedirectUrl='/dashboard/billing/checkout-result'
                pendingRedirectUrl='/dashboard/billing/checkout-result'
                fallbackLabel='Lanjutkan Pembayaran'
                variant='outline'
              >
                Lanjutkan Pembayaran
              </MidtransSnapCheckout>
              <CancelPendingBillingButton label='Batalkan Pembayaran' />
            </div>
          )}
        </CardContent>
      )}

      {resultState === 'success' && billing && (
        <CardContent className='space-y-4'>
          <Alert>
            <Icons.circleCheck />
            <AlertTitle>Pembayaran berhasil diverifikasi</AlertTitle>
            <AlertDescription>
              Plan aktif tenant sudah diperbarui dan siap dipakai.
            </AlertDescription>
          </Alert>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Plan Aktif</p>
              <p className='mt-1 text-lg font-semibold'>{billing.plan.display_name}</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Siklus Billing</p>
              <p className='mt-1 text-lg font-semibold'>
                {formatBillingCycle(billing.billing_cycle)}
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Nominal</p>
              <p className='mt-1 text-lg font-semibold'>
                {billing.amount ? formatRupiah(Number(billing.amount)) : '-'}
              </p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Aktif Sampai</p>
              <p className='mt-1 text-lg font-semibold'>{formatDate(billing.expired_at)}</p>
            </div>
          </div>

          {pendingPayment && (
            <div className='flex flex-wrap gap-2'>
              <MidtransSnapCheckout
                snapToken={pendingPayment.snap_token}
                paymentUrl={pendingPayment.payment_url}
                clientKey={pendingPayment.client_key}
                orderId={pendingPayment.order_id || pendingPayment.id}
                successRedirectUrl='/dashboard/billing/checkout-result'
                pendingRedirectUrl='/dashboard/billing/checkout-result'
                fallbackLabel='Lanjutkan Pembayaran'
                variant='outline'
              >
                Lanjutkan Pembayaran
              </MidtransSnapCheckout>
              <CancelPendingBillingButton label='Batalkan Pembayaran' />
            </div>
          )}
        </CardContent>
      )}

      {resultState === 'pending' && billing && (
        <CardContent className='space-y-4'>
          <Alert variant='warning'>
            <Icons.clock />
            <AlertTitle>Pembayaran masih diproses</AlertTitle>
            <AlertDescription>
              Billing sudah tercatat, tetapi status finalnya belum aktif. Anda bisa cek lagi
              sebentar lagi.
            </AlertDescription>
          </Alert>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Plan</p>
              <p className='mt-1 text-lg font-semibold'>{billing.plan.display_name}</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-sm text-muted-foreground'>Siklus Billing</p>
              <p className='mt-1 text-lg font-semibold'>
                {formatBillingCycle(billing.billing_cycle)}
              </p>
            </div>
          </div>

          {pendingPayment && (
            <div className='flex flex-wrap gap-2'>
              <MidtransSnapCheckout
                snapToken={pendingPayment.snap_token}
                paymentUrl={pendingPayment.payment_url}
                clientKey={pendingPayment.client_key}
                orderId={pendingPayment.order_id || pendingPayment.id}
                successRedirectUrl='/dashboard/billing/checkout-result'
                pendingRedirectUrl='/dashboard/billing/checkout-result'
                fallbackLabel='Lanjutkan Pembayaran'
                variant='outline'
              >
                Lanjutkan Pembayaran
              </MidtransSnapCheckout>
              <CancelPendingBillingButton label='Batalkan Pembayaran' />
            </div>
          )}
        </CardContent>
      )}

      {resultState === 'failed' && (
        <CardContent className='space-y-4'>
          <Alert variant='destructive'>
            <Icons.warning />
            <AlertTitle>Pembayaran belum berhasil diverifikasi</AlertTitle>
            <AlertDescription>
              Status billing aktif belum menunjukkan pembayaran berhasil. Silakan cek lagi atau
              kembali ke halaman upgrade plan.
            </AlertDescription>
          </Alert>

          {pendingPayment && (
            <div className='flex flex-wrap gap-2'>
              <MidtransSnapCheckout
                snapToken={pendingPayment.snap_token}
                paymentUrl={pendingPayment.payment_url}
                clientKey={pendingPayment.client_key}
                orderId={pendingPayment.order_id || pendingPayment.id}
                successRedirectUrl='/dashboard/billing/checkout-result'
                pendingRedirectUrl='/dashboard/billing/checkout-result'
                fallbackLabel='Lanjutkan Pembayaran'
                variant='outline'
              >
                Lanjutkan Pembayaran
              </MidtransSnapCheckout>
              <CancelPendingBillingButton label='Batalkan Pembayaran' />
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className='flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={() => {
            setPollCount(0);
            void query.refetch();
          }}
        >
          <Icons.refresh className='h-4 w-4' />
          Cek status lagi
        </Button>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Button asChild variant='outline'>
            <Link href='/dashboard/billing?tab=upgrade'>Kembali ke Upgrade Plan</Link>
          </Button>
          <Button asChild>
            <Link href='/dashboard/billing?tab=billing'>Lihat Billing Aktif</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
