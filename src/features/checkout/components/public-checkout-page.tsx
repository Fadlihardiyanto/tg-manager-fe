'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

function DetailRow({
  label,
  children,
  mono
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className='flex items-center justify-between gap-3 py-2'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span
        className={`text-sm font-semibold ${
          mono ? 'font-mono text-xs text-foreground' : 'text-foreground'
        }`}
      >
        {children}
      </span>
    </div>
  );
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

  const amount = formatAmount(payment?.amount);

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.04),transparent_50%)]' />

      <div className='w-full max-w-4xl animate-fade-up'>
        {/* Header */}
        <div className='mb-8 flex flex-col items-center gap-3 text-center'>
          <div className='bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full'>
            <Icons.creditCard className='size-7' />
          </div>
          <div className='space-y-1.5'>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
              Selesaikan Pembayaran Anda
            </h1>
            <p className='mx-auto max-w-md text-sm text-muted-foreground sm:text-base'>
              Amankan akses grup premium Anda dengan menyelesaikan pembayaran di bawah ini.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className='grid gap-6 lg:grid-cols-[1fr_1.1fr]'>
          {/* Kiri: info order */}
          <div className='flex flex-col justify-between rounded-xl border bg-background/80 p-6 shadow-sm'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                Ringkasan Pesanan
              </p>
              <div className='mt-4 divide-y divide-border'>
                <DetailRow label='ID Transaksi' mono>
                  {payment?.order_id || '-'}
                </DetailRow>
                <DetailRow label='Tenant'>
                  {payment?.slug ? <Badge variant='outline'>{payment.slug}</Badge> : '-'}
                </DetailRow>
                <DetailRow label='Paket'>{payment?.package_name || '-'}</DetailRow>
              </div>
            </div>

            <Button asChild variant='ghost' className='mt-6 self-start'>
              <Link href='/'>
                <Icons.arrowLeft className='size-4' />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>

          {/* Kanan: pembayaran */}
          <div className='flex flex-col rounded-xl border border-primary/15 bg-background/80 p-6 shadow-sm'>
            {query.isLoading ? (
              <div className='space-y-3'>
                <div className='bg-muted h-12 animate-pulse rounded-lg' />
                <div className='bg-muted h-24 animate-pulse rounded-lg' />
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
              <div className='flex flex-1 flex-col gap-6'>
                {/* Harga prominent */}
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Total Pembayaran</p>
                  <p className='mt-1 text-4xl font-bold tracking-tight text-foreground'>{amount}</p>
                  {payment.package_name ? (
                    <p className='mt-1 text-sm text-muted-foreground'>
                      untuk {payment.package_name}
                    </p>
                  ) : null}
                </div>

                <div className='h-px bg-border' />

                {/* Metode pembayaran */}
                <div>
                  <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                    Metode Pembayaran
                  </p>
                  <div className='mt-3 flex items-center gap-3 rounded-lg border bg-muted/30 p-3'>
                    <div className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg'>
                      <Icons.wallet className='size-5' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold'>Midtrans</p>
                      <p className='text-xs text-muted-foreground'>
                        Transfer bank, e-wallet & kartu kredit
                      </p>
                    </div>
                    <Icons.circleCheck className='size-5 text-emerald-500' />
                  </div>
                </div>

                {/* Tombol bayar */}
                <div className='mt-auto space-y-3'>
                  <MidtransSnapCheckout
                    snapToken={payment.snap_token}
                    paymentUrl={payment.payment_url}
                    clientKey={payment.client_key}
                    orderId={payment.order_id}
                    successRedirectUrl={successUrl}
                    pendingRedirectUrl={successUrl}
                    fallbackLabel='Buka Pembayaran'
                    autoOpen={Boolean(payment.snap_token)}
                    className='h-12 w-full rounded-full text-base'
                  >
                    Bayar Sekarang
                  </MidtransSnapCheckout>

                  <p className='flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground'>
                    <Icons.lock className='size-3.5' />
                    Pembayaran diproses secara aman
                  </p>
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
          </div>
        </div>
      </div>
    </main>
  );
}
