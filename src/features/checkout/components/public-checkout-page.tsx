'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { formatRupiah } from '@/lib/format';
import { publicCheckoutQueryOptions } from '../api/queries';
import type { PublicCheckoutData } from '../api/types';

function getParamValue(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value && value.trim() ? value : undefined;
}

function buildSuccessUrl(payment: PublicCheckoutData | null) {
  const params = new URLSearchParams();

  if (payment?.order_id) params.set('order_id', payment.order_id);
  if (payment?.bot) params.set('bot', payment.bot);
  if (payment?.slug) params.set('slug', payment.slug);

  const query = params.toString();
  return `/checkout/success${query ? `?${query}` : ''}`;
}

function formatAmount(amount?: string) {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) && value > 0 ? formatRupiah(value) : '-';
}

export function PublicCheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = getParamValue(searchParams, 'order_id') || '';
  const queryPayment = useMemo<PublicCheckoutData | null>(() => {
    const snapToken = getParamValue(searchParams, 'snap_token');
    const paymentUrl = getParamValue(searchParams, 'payment_url');

    if (!orderId && !snapToken && !paymentUrl) return null;

    return {
      order_id: orderId,
      snap_token: snapToken,
      payment_url: paymentUrl,
      client_key: getParamValue(searchParams, 'client_key'),
      bot: getParamValue(searchParams, 'bot'),
      slug: getParamValue(searchParams, 'slug'),
      amount: getParamValue(searchParams, 'amount'),
      package_name: getParamValue(searchParams, 'package_name'),
      status: getParamValue(searchParams, 'status')
    };
  }, [orderId, searchParams]);

  const shouldFetchCheckout = Boolean(
    orderId && !queryPayment?.snap_token && !queryPayment?.payment_url
  );
  const query = useQuery({
    ...publicCheckoutQueryOptions(orderId),
    enabled: shouldFetchCheckout
  });
  const fetchedPayment = query.data?.success ? query.data.data : null;
  const payment = fetchedPayment || queryPayment;
  const successUrl = buildSuccessUrl(payment);

  return (
    <main className='from-background via-background to-primary/5 flex min-h-screen items-center justify-center bg-gradient-to-b px-4 py-10'>
      <Card className='w-full max-w-2xl border-primary/15 shadow-sm'>
        <CardHeader className='text-center'>
          <div className='bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Icons.creditCard className='h-9 w-9' />
          </div>
          <div className='space-y-2'>
            <CardTitle className='text-2xl'>Checkout Pembayaran</CardTitle>
            <CardDescription>
              Selesaikan pembayaran paket Anda tanpa meninggalkan website Urator.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-5'>
          {query.isLoading ? (
            <div className='space-y-3'>
              <div className='bg-muted h-16 animate-pulse rounded-lg' />
              <div className='bg-muted h-16 animate-pulse rounded-lg' />
            </div>
          ) : null}

          {query.data?.success === false ? (
            <Alert variant='warning'>
              <Icons.warning />
              <AlertTitle>Detail checkout belum bisa dimuat</AlertTitle>
              <AlertDescription>{query.data.message}</AlertDescription>
            </Alert>
          ) : null}

          {payment ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>ID Transaksi</p>
                <p className='mt-1 font-semibold'>{payment.order_id || '-'}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Total Pembayaran</p>
                <p className='mt-1 font-semibold'>{formatAmount(payment.amount)}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Paket</p>
                <p className='mt-1 font-semibold'>{payment.package_name || '-'}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Tenant</p>
                <div className='mt-1'>
                  <Badge variant='outline'>{payment.slug || '-'}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant='warning'>
              <Icons.info />
              <AlertTitle>Data checkout belum tersedia</AlertTitle>
              <AlertDescription>
                Buka halaman ini dari tautan pembayaran Telegram agar detail transaksi bisa
                ditampilkan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
          <Button asChild variant='outline'>
            <Link href='/'>Kembali ke Beranda</Link>
          </Button>

          {payment ? (
            <MidtransSnapCheckout
              snapToken={payment.snap_token}
              paymentUrl={payment.payment_url}
              clientKey={payment.client_key}
              orderId={payment.order_id}
              successRedirectUrl={successUrl}
              pendingRedirectUrl={successUrl}
              fallbackLabel='Buka Pembayaran'
              autoOpen={Boolean(payment.snap_token)}
            >
              Bayar dengan Midtrans
            </MidtransSnapCheckout>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
