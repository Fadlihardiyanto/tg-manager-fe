'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PageTabs } from '@/components/ui/page-tabs';
import { Icons } from '@/components/icons';
import { MidtransSnapCheckout } from '@/components/payments/midtrans-snap-checkout';
import { formatDate, formatRupiah } from '@/lib/format';
import { checkoutBillingPlan } from '../api/service';
import { billingHistoryQueryOptions, publicPlansQueryOptions } from '../api/queries';
import type { ActivePlan, BillingCycle, CheckoutBillingData } from '../api/types';
import { useActivePlan } from './active-plan-provider';
import { BillingHistoryTab } from './billing-history-tab';
import { CancelPendingBillingButton } from './cancel-pending-billing-button';
import { useTenantPath } from '@/lib/tenant-path';

const quotaItems = [
  { key: 'bots', label: 'Bot', description: 'Jumlah bot Telegram yang masih bisa dikelola.' },
  { key: 'groups', label: 'Grup', description: 'Jumlah grup Telegram yang bisa dihubungkan.' },
  { key: 'packages', label: 'Paket', description: 'Jumlah paket yang bisa dibuat.' },
  { key: 'members', label: 'Member', description: 'Total member aktif yang bisa disimpan.' },
  {
    key: 'custom_commands',
    label: 'Perintah Kustom',
    description: 'Jumlah command kustom yang bisa dipakai.'
  },
  {
    key: 'broadcasts',
    label: 'Siaran',
    description: 'Kuota siaran yang tersedia pada periode aktif.'
  }
] as const;

const featureItems = [
  { key: 'allow_media_broadcast', label: 'Siaran Media' },
  { key: 'allow_discount_system', label: 'Sistem Diskon' },
  { key: 'allow_reports_export', label: 'Ekspor Laporan' },
  { key: 'allow_high_priority', label: 'Antrian Prioritas Tinggi' }
] as const;

function formatBillingCycle(cycle?: BillingCycle) {
  if (cycle === 'monthly') return 'Bulanan';
  if (cycle === 'yearly') return 'Tahunan';
  return '-';
}

function formatStatus(status?: string) {
  if (!status) return '-';
  if (status === 'active') return 'Aktif';
  if (status === 'pending') return 'Menunggu Pembayaran';
  if (status === 'past_due') return 'Terlambat';
  return status;
}

function formatPlanPrice(plan: ActivePlan, billingCycle: BillingCycle) {
  const rawPrice = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const price = Number(rawPrice ?? 0);
  return Number.isFinite(price) ? formatRupiah(price) : '-';
}

function formatQuotaLimit(limit: number) {
  return limit === -1 ? 'Tak terbatas' : limit.toLocaleString('id-ID');
}

const billingTabs = [
  { value: 'billing', label: 'Penagihan Aktif' },
  { value: 'upgrade', label: 'Tingkatkan Paket' },
  { value: 'history', label: 'Riwayat Pembayaran' }
];

export function ActivePlanPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const { getTenantHref } = useTenantPath();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutPayment, setCheckoutPayment] = useState<CheckoutBillingData | null>(null);
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsString.withDefault('billing').withOptions({ shallow: false, history: 'replace' })
  );
  const { billing, plan, usage, isLoading, canUseFeature, getQuota } = useActivePlan();
  const publicPlansQuery = useQuery(publicPlansQueryOptions());
  const pendingPaymentQuery = useQuery({
    ...billingHistoryQueryOptions({ page: 1, limit: 5 }),
    staleTime: 0
  });
  const pendingPayment = pendingPaymentQuery.data?.data?.find((item) => {
    if (item.status !== 'pending' || (!item.snap_token && !item.payment_url)) return false;
    if (!billing || billing.status !== 'active') return true;

    const pendingTime = Date.parse(item.created_at || item.started_at);
    const activeTime = Date.parse(billing.paid_at || billing.started_at);

    return Number.isFinite(pendingTime) && Number.isFinite(activeTime) && pendingTime > activeTime;
  });

  const publicPlans = (publicPlansQuery.data?.success ? publicPlansQuery.data.data : []).filter(
    (item) => item.is_active ?? true
  );
  const selectedPlan = useMemo(
    () => publicPlans.find((item) => item.id === selectedPlanId) ?? null,
    [publicPlans, selectedPlanId]
  );

  const checkoutMutation = useMutation({
    mutationFn: checkoutBillingPlan,
    onSuccess: (response) => {
      if (response.success && (response.data?.snap_token || response.data?.payment_url)) {
        setCheckoutPayment(response.data);
        return;
      }

      toast.error(response.message || 'Gagal memulai checkout plan.');
    },
    onError: () => toast.error('Gagal memulai checkout plan.')
  });

  const handleCheckout = (planId: string) => {
    checkoutMutation.mutate({
      plan_id: planId,
      billing_cycle: billingCycle
    });
  };

  const isCurrentBillingCycle = billing?.billing_cycle === billingCycle;

  const openCheckoutDialog = (planId: string) => {
    setSelectedPlanId(planId);
    setCheckoutPayment(null);
    setConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <div className='grid gap-4 lg:grid-cols-[1.4fr_1fr]'>
        <div className='rounded-xl border bg-card p-6'>
          <div className='bg-muted h-7 w-40 animate-pulse rounded' />
          <div className='bg-muted mt-3 h-4 w-64 animate-pulse rounded' />
          <div className='bg-muted mt-6 h-24 animate-pulse rounded' />
        </div>
        <div className='rounded-xl border bg-card p-6'>
          <div className='bg-muted h-7 w-32 animate-pulse rounded' />
          <div className='bg-muted mt-3 h-4 w-40 animate-pulse rounded' />
          <div className='bg-muted mt-6 h-24 animate-pulse rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <PageTabs value={tab} onValueChange={setTab} items={billingTabs} />

      {tab === 'billing' && (
        <div className='space-y-6'>
          {pendingPayment && (
            <Alert variant='warning'>
              <Icons.clock />
              <AlertTitle>Pembayaran belum selesai</AlertTitle>
              <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <span>Lanjutkan pembayaran agar paket bisa aktif.</span>
                <span className='flex flex-wrap gap-2'>
                  <MidtransSnapCheckout
                    snapToken={pendingPayment.snap_token}
                    paymentUrl={pendingPayment.payment_url}
                    clientKey={pendingPayment.client_key}
                    orderId={pendingPayment.order_id || pendingPayment.id}
                    successRedirectUrl='/dashboard/billing/checkout-result'
                    pendingRedirectUrl='/dashboard/billing/checkout-result'
                    fallbackLabel='Lanjutkan Pembayaran'
                    size='sm'
                  >
                    Lanjutkan Pembayaran
                  </MidtransSnapCheckout>
                  <CancelPendingBillingButton size='sm' />
                </span>
              </AlertDescription>
            </Alert>
          )}

          {billing && plan ? (
            <div className='grid gap-4 xl:grid-cols-[1.35fr_0.65fr]'>
              <Card className='overflow-hidden'>
                <CardContent className='p-0'>
                  <div className='flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between'>
                    <div className='min-w-0 space-y-5'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <div className='bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full'>
                          <Icons.pro className='h-5 w-5' />
                        </div>
                        <div>
                          <p className='text-sm text-muted-foreground'>Paket aktif</p>
                          <h2 className='text-2xl font-semibold tracking-tight'>
                            {plan.display_name}
                          </h2>
                        </div>
                        <Badge variant={billing.status === 'active' ? 'secondary' : 'outline'}>
                          {formatStatus(billing.status)}
                        </Badge>
                      </div>

                      <div className='grid gap-3 sm:grid-cols-3'>
                        <div>
                          <p className='text-sm text-muted-foreground'>Tagihan</p>
                          <p className='text-xl font-semibold'>
                            {billing.amount ? formatRupiah(Number(billing.amount)) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-muted-foreground'>Siklus</p>
                          <p className='text-xl font-semibold'>
                            {formatBillingCycle(billing.billing_cycle)}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-muted-foreground'>Berakhir</p>
                          <p className='text-xl font-semibold'>{formatDate(billing.expired_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-2 md:justify-end'>
                      {(billing.snap_token || billing.payment_url) &&
                      billing.status !== 'active' ? (
                        <MidtransSnapCheckout
                          snapToken={billing.snap_token}
                          paymentUrl={billing.payment_url}
                          clientKey={billing.client_key}
                          orderId={billing.order_id || billing.id}
                          successRedirectUrl={getTenantHref('/dashboard/billing/checkout-result')}
                          pendingRedirectUrl={getTenantHref('/dashboard/billing/checkout-result')}
                          fallbackLabel='Lanjutkan Pembayaran'
                        >
                          Lanjutkan Pembayaran
                        </MidtransSnapCheckout>
                      ) : null}
                      <Button asChild variant='outline'>
                        <Link href={getTenantHref('/dashboard/billing?tab=upgrade')}>
                          <Icons.rocket className='h-4 w-4' />
                          Upgrade Plan
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>Status periode penagihan saat ini.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                  {[
                    ['Mulai aktif', formatDate(billing.started_at)],
                    [
                      'Pembayaran',
                      billing.paid_at ? formatDate(billing.paid_at) : 'Belum tercatat'
                    ],
                    ['Berakhir', formatDate(billing.expired_at)]
                  ].map(([label, value]) => (
                    <div key={label} className='flex items-center gap-3'>
                      <span className='bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                        <Icons.check className='h-4 w-4' />
                      </span>
                      <div>
                        <p className='font-medium'>{label}</p>
                        <p className='text-muted-foreground'>{value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert variant='warning'>
              <Icons.warning />
              <AlertTitle>Belum ada penagihan aktif</AlertTitle>
              <AlertDescription>
                Tenant ini belum memiliki langganan aktif. Buka tab tingkatkan paket untuk memilih
                paket.
              </AlertDescription>
            </Alert>
          )}

          <div className='grid gap-4 xl:grid-cols-[1.2fr_0.8fr]'>
            <Card>
              <CardHeader>
                <CardTitle>Pemakaian Kuota</CardTitle>
                <CardDescription>
                  Pantau batas utama tenant tanpa perlu membuka tiap menu.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {usage && plan ? (
                  quotaItems.map((item) => {
                    const quota = getQuota(item.key);
                    if (!quota) return null;

                    return (
                      <div key={item.key} className='space-y-2'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                          <div>
                            <p className='font-medium'>{item.label}</p>
                            <p className='text-sm text-muted-foreground'>{item.description}</p>
                          </div>
                          <Badge variant={quota.hasQuota ? 'secondary' : 'destructive'}>
                            {quota.isUnlimited ? 'Tak terbatas' : `${quota.remaining} tersisa`}
                          </Badge>
                        </div>
                        {!quota.isUnlimited ? (
                          <Progress value={quota.percentage} />
                        ) : (
                          <div className='bg-muted h-2 rounded-full' />
                        )}
                        <p className='text-xs text-muted-foreground tabular-nums'>
                          {quota.used.toLocaleString('id-ID')} /{' '}
                          {quota.isUnlimited ? 'Tak terbatas' : quota.limit.toLocaleString('id-ID')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <Alert variant='warning'>
                    <Icons.warning />
                    <AlertTitle>Kuota belum tersedia</AlertTitle>
                    <AlertDescription>
                      Data pemakaian kuota akan tampil setelah tenant memiliki paket aktif.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Akses Fitur</CardTitle>
                <CardDescription>Fitur yang sudah aktif di paket tenant.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {plan ? (
                  featureItems.map((feature) => {
                    const enabled = canUseFeature(feature.key);

                    return (
                      <div
                        key={feature.key}
                        className='flex items-center justify-between gap-3 rounded-lg border p-3'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <span className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full'>
                            {enabled ? (
                              <Icons.check className='h-4 w-4 text-primary' />
                            ) : (
                              <Icons.lock className='h-4 w-4 text-muted-foreground' />
                            )}
                          </span>
                          <span className='truncate text-sm font-medium'>{feature.label}</span>
                        </div>
                        <Badge variant={enabled ? 'secondary' : 'outline'}>
                          {enabled ? 'Aktif' : 'Terkunci'}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <Alert variant='warning'>
                    <Icons.lock />
                    <AlertTitle>Fitur premium belum aktif</AlertTitle>
                    <AlertDescription>
                      Pilih salah satu plan untuk mulai membuka fitur platform yang dibutuhkan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'upgrade' && (
        <>
          {pendingPayment && (
            <Alert variant='warning'>
              <Icons.clock />
              <AlertTitle>Pembayaran belum selesai</AlertTitle>
              <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <span>Selesaikan pembayaran sebelumnya sebelum memilih paket baru.</span>
                <span className='flex flex-wrap gap-2'>
                  <MidtransSnapCheckout
                    snapToken={pendingPayment.snap_token}
                    paymentUrl={pendingPayment.payment_url}
                    clientKey={pendingPayment.client_key}
                    orderId={pendingPayment.order_id || pendingPayment.id}
                    successRedirectUrl='/dashboard/billing/checkout-result'
                    pendingRedirectUrl='/dashboard/billing/checkout-result'
                    fallbackLabel='Lanjutkan Pembayaran'
                    size='sm'
                  >
                    Lanjutkan Pembayaran
                  </MidtransSnapCheckout>
                  <CancelPendingBillingButton size='sm' />
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tingkatkan Paket</CardTitle>
              <CardDescription>
                Pilih paket platform yang tersedia, tinjau dulu detailnya, lalu lanjut ke checkout
                penagihan tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {billing?.status === 'active' &&
                plan &&
                !publicPlans.some(
                  (p) => p.id !== plan.id && (p.max_members ?? 0) > (plan.max_members ?? 0)
                ) && (
                  <Alert>
                    <Icons.circleCheck />
                    <AlertTitle>Paket tertinggi sudah aktif</AlertTitle>
                    <AlertDescription>
                      Anda sudah menggunakan paket <strong>{plan.display_name}</strong> — paket
                      tertinggi yang tersedia saat ini.
                    </AlertDescription>
                  </Alert>
                )}
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Bulanan
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Tahunan
                </Button>
              </div>

              {publicPlansQuery.isLoading ? (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='rounded-xl border p-5'>
                      <div className='bg-muted h-6 w-28 animate-pulse rounded' />
                      <div className='bg-muted mt-3 h-8 w-36 animate-pulse rounded' />
                      <div className='bg-muted mt-5 h-20 animate-pulse rounded' />
                    </div>
                  ))}
                </div>
              ) : publicPlans.length > 0 ? (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {publicPlans.map((publicPlan) => {
                    const isCurrentPlan =
                      billing?.plan.id === publicPlan.id && billing?.status === 'active';
                    const isCurrentPlanSameCycle = isCurrentPlan && isCurrentBillingCycle;

                    return (
                      <div key={publicPlan.id} className='rounded-xl border p-5'>
                        <div className='flex items-start justify-between gap-3'>
                          <div>
                            <h3 className='text-lg font-semibold'>{publicPlan.display_name}</h3>
                            <p className='mt-1 text-sm text-muted-foreground'>{publicPlan.name}</p>
                          </div>
                          {isCurrentPlan && <Badge variant='secondary'>Paket Aktif</Badge>}
                        </div>

                        <div className='mt-4'>
                          <p className='text-2xl font-bold'>
                            {formatPlanPrice(publicPlan, billingCycle)}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            per {billingCycle === 'monthly' ? 'bulan' : 'tahun'}
                          </p>
                        </div>

                        <Separator className='my-4' />

                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>Bot</span>
                            <span className='font-medium'>
                              {formatQuotaLimit(publicPlan.max_bots)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>Grup</span>
                            <span className='font-medium'>
                              {formatQuotaLimit(publicPlan.max_groups)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>Paket</span>
                            <span className='font-medium'>
                              {formatQuotaLimit(publicPlan.max_packages)}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>Member</span>
                            <span className='font-medium'>
                              {formatQuotaLimit(publicPlan.max_members)}
                            </span>
                          </div>
                        </div>

                        <div className='mt-4 flex flex-wrap gap-2'>
                          <Badge
                            variant={publicPlan.allow_discount_system ? 'secondary' : 'outline'}
                          >
                            Diskon
                          </Badge>
                          <Badge
                            variant={publicPlan.allow_media_broadcast ? 'secondary' : 'outline'}
                          >
                            Siaran Media
                          </Badge>
                          <Badge
                            variant={publicPlan.allow_reports_export ? 'secondary' : 'outline'}
                          >
                            Laporan
                          </Badge>
                        </div>

                        <Button
                          type='button'
                          className='mt-5 w-full'
                          disabled={isCurrentPlanSameCycle}
                          onClick={() => openCheckoutDialog(publicPlan.id)}
                        >
                          {isCurrentPlanSameCycle ? 'Sedang Aktif' : 'Pilih Paket Ini'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert variant='warning'>
                  <Icons.warning />
                  <AlertTitle>Daftar paket belum tersedia</AlertTitle>
                  <AlertDescription>
                    Endpoint paket publik belum mengembalikan data. Untuk sementara, peningkatan
                    masih bisa dilanjutkan lewat dukungan.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            {publicPlans.length === 0 && (
              <CardFooter>
                <Button asChild>
                  <Link href='https://t.me/UrationSupportBot' target='_blank' rel='noreferrer'>
                    <Icons.telegram className='h-4 w-4' />
                    Hubungi Support
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi peningkatan paket</DialogTitle>
                <DialogDescription>
                  Tinjau singkat pilihan paket sebelum membuka pembayaran Midtrans.
                </DialogDescription>
              </DialogHeader>

              {checkoutPayment ? (
                <Alert>
                  <Icons.creditCard className='h-4 w-4' />
                  <AlertTitle>Checkout siap dibuka</AlertTitle>
                  <AlertDescription>
                    Pembayaran akan dibuka di website ini. Jika popup belum muncul, klik tombol
                    bayar di bawah.
                  </AlertDescription>
                </Alert>
              ) : null}

              {selectedPlan && (
                <div className='space-y-4'>
                  <div className='rounded-lg border p-4'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='font-semibold'>{selectedPlan.display_name}</span>
                      <Badge variant='secondary'>{formatBillingCycle(billingCycle)}</Badge>
                      <Badge variant='outline'>{formatPlanPrice(selectedPlan, billingCycle)}</Badge>
                    </div>
                    {billing?.plan.id === selectedPlan.id && billing?.status === 'active' && (
                      <p className='mt-2 text-sm text-muted-foreground'>
                        {isCurrentBillingCycle
                          ? 'Paket ini sudah aktif pada siklus penagihan yang sama.'
                          : 'Anda sedang memilih paket yang sama dengan siklus penagihan berbeda.'}
                      </p>
                    )}
                  </div>

                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='flex items-center justify-between rounded-lg border p-3 text-sm'>
                      <span className='text-muted-foreground'>Bot</span>
                      <span className='font-medium'>{formatQuotaLimit(selectedPlan.max_bots)}</span>
                    </div>
                    <div className='flex items-center justify-between rounded-lg border p-3 text-sm'>
                      <span className='text-muted-foreground'>Grup</span>
                      <span className='font-medium'>
                        {formatQuotaLimit(selectedPlan.max_groups)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between rounded-lg border p-3 text-sm'>
                      <span className='text-muted-foreground'>Paket</span>
                      <span className='font-medium'>
                        {formatQuotaLimit(selectedPlan.max_packages)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between rounded-lg border p-3 text-sm'>
                      <span className='text-muted-foreground'>Member</span>
                      <span className='font-medium'>
                        {formatQuotaLimit(selectedPlan.max_members)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setConfirmOpen(false)}>
                  Batal
                </Button>
                {checkoutPayment ? (
                  <MidtransSnapCheckout
                    snapToken={checkoutPayment.snap_token}
                    paymentUrl={checkoutPayment.payment_url}
                    clientKey={checkoutPayment.client_key}
                    orderId={checkoutPayment.order_id}
                    successRedirectUrl='/dashboard/billing/checkout-result'
                    pendingRedirectUrl='/dashboard/billing/checkout-result'
                    fallbackLabel='Buka Pembayaran'
                    autoOpen
                  >
                    Bayar dengan Midtrans
                  </MidtransSnapCheckout>
                ) : (
                  <Button
                    type='button'
                    isLoading={checkoutMutation.isPending}
                    disabled={
                      !selectedPlan ||
                      (billing?.plan.id === selectedPlan.id &&
                        billing?.status === 'active' &&
                        isCurrentBillingCycle)
                    }
                    onClick={() => selectedPlan && handleCheckout(selectedPlan.id)}
                  >
                    {selectedPlan &&
                    billing?.plan.id === selectedPlan.id &&
                    billing?.status === 'active' &&
                    isCurrentBillingCycle
                      ? 'Paket Ini Sudah Aktif'
                      : 'Lanjut ke Pembayaran'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {tab === 'history' && <BillingHistoryTab />}
    </div>
  );
}
