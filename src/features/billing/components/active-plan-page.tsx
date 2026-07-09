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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { MidtransSnapCheckout } from '@/components/payments/midtrans-snap-checkout';
import { formatDate, formatRupiah } from '@/lib/format';
import { checkoutBillingPlan } from '../api/service';
import { publicPlansQueryOptions } from '../api/queries';
import type { ActivePlan, BillingCycle, CheckoutBillingData } from '../api/types';
import { useActivePlan } from './active-plan-provider';
import { BillingHistoryTab } from './billing-history-tab';

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
  if (status === 'expired') return 'Kedaluwarsa';
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

type BillingPageTab = 'billing' | 'upgrade' | 'history';

export function ActivePlanPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutPayment, setCheckoutPayment] = useState<CheckoutBillingData | null>(null);
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsString.withDefault('billing').withOptions({ shallow: false, history: 'replace' })
  );
  const { billing, plan, usage, isLoading, canUseFeature, getQuota } = useActivePlan();
  const publicPlansQuery = useQuery(publicPlansQueryOptions());

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
    <Tabs
      value={tab as BillingPageTab}
      onValueChange={(value) => setTab(value)}
      className='space-y-6'
    >
      <TabsList>
        <TabsTrigger value='billing'>Penagihan Aktif</TabsTrigger>
        <TabsTrigger value='upgrade'>Tingkatkan Paket</TabsTrigger>
        <TabsTrigger value='history'>Riwayat Pembayaran</TabsTrigger>
      </TabsList>

      <TabsContent value='billing' className='space-y-6'>
        {billing && plan ? (
          <Card>
            <CardHeader>
              <div className='flex flex-wrap items-center gap-3'>
                <CardTitle>Paket Tenant Aktif</CardTitle>
                <Badge variant='secondary'>{plan.display_name}</Badge>
                <Badge variant='outline'>{formatBillingCycle(billing.billing_cycle)}</Badge>
              </div>
              <CardDescription>
                Ringkasan penagihan aktif tenant beserta masa berlaku, nominal, dan status
                pembayaran.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Status</p>
                <p className='mt-1 text-lg font-semibold'>{formatStatus(billing.status)}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Siklus Penagihan</p>
                <p className='mt-1 text-lg font-semibold'>
                  {formatBillingCycle(billing.billing_cycle)}
                </p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Nominal Tagihan</p>
                <p className='mt-1 text-lg font-semibold'>
                  {billing.amount ? formatRupiah(Number(billing.amount)) : '-'}
                </p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Mulai Aktif</p>
                <p className='mt-1 text-lg font-semibold'>{formatDate(billing.started_at)}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Berakhir Pada</p>
                <p className='mt-1 text-lg font-semibold'>{formatDate(billing.expired_at)}</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-sm text-muted-foreground'>Pembayaran Tercatat</p>
                <p className='mt-1 text-lg font-semibold'>
                  {billing.paid_at ? formatDate(billing.paid_at) : '-'}
                </p>
              </div>
            </CardContent>
            {(billing.snap_token || billing.payment_url) && billing.status !== 'active' && (
              <CardFooter>
                <MidtransSnapCheckout
                  snapToken={billing.snap_token}
                  paymentUrl={billing.payment_url}
                  clientKey={billing.client_key}
                  orderId={billing.order_id || billing.id}
                  successRedirectUrl='/dashboard/billing/checkout-result'
                  fallbackLabel='Lanjutkan Pembayaran'
                >
                  Lanjutkan Pembayaran
                </MidtransSnapCheckout>
              </CardFooter>
            )}
          </Card>
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

        <div className='grid gap-4 xl:grid-cols-[1.2fr_1fr]'>
          <Card>
            <CardHeader>
              <CardTitle>Kuota Tersedia</CardTitle>
              <CardDescription>
                Detail penggunaan dan sisa kuota tenant untuk setiap resource utama.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              {usage && plan ? (
                quotaItems.map((item) => {
                  const quota = getQuota(item.key);
                  if (!quota) return null;

                  return (
                    <div key={item.key} className='rounded-lg border p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <h3 className='font-medium'>{item.label}</h3>
                          <p className='mt-1 text-sm text-muted-foreground'>{item.description}</p>
                        </div>
                        <Badge variant={quota.hasQuota ? 'secondary' : 'destructive'}>
                          {quota.isUnlimited ? 'Tak terbatas' : `${quota.remaining} tersisa`}
                        </Badge>
                      </div>
                      <Separator className='my-4' />
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>Terpakai</span>
                          <span className='font-medium tabular-nums'>{quota.used}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>Batas</span>
                          <span className='font-medium tabular-nums'>
                            {quota.isUnlimited ? 'Tak terbatas' : quota.limit}
                          </span>
                        </div>
                      </div>
                      {!quota.isUnlimited && <Progress className='mt-4' value={quota.percentage} />}
                    </div>
                  );
                })
              ) : (
                <Alert variant='warning' className='md:col-span-2'>
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
              <CardDescription>
                Status fitur khusus platform yang aktif atau masih terkunci di paket tenant saat
                ini.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {plan ? (
                featureItems.map((feature) => (
                  <div
                    key={feature.key}
                    className='flex items-center justify-between rounded-lg border p-3 text-sm'
                  >
                    <span className='font-medium'>{feature.label}</span>
                    <Badge variant={canUseFeature(feature.key) ? 'secondary' : 'outline'}>
                      {canUseFeature(feature.key) ? 'Aktif' : 'Terkunci'}
                    </Badge>
                  </div>
                ))
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
      </TabsContent>

      <TabsContent value='upgrade'>
        <Card>
          <CardHeader>
            <CardTitle>Tingkatkan Paket</CardTitle>
            <CardDescription>
              Pilih paket platform yang tersedia, tinjau dulu detailnya, lalu lanjut ke checkout
              penagihan tenant.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
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
                        <Badge variant={publicPlan.allow_discount_system ? 'secondary' : 'outline'}>
                          Diskon
                        </Badge>
                        <Badge variant={publicPlan.allow_media_broadcast ? 'secondary' : 'outline'}>
                          Siaran Media
                        </Badge>
                        <Badge variant={publicPlan.allow_reports_export ? 'secondary' : 'outline'}>
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
                  Endpoint paket publik belum mengembalikan data. Untuk sementara, peningkatan masih
                  bisa dilanjutkan lewat dukungan.
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
                  Pembayaran akan dibuka di website ini. Jika popup belum muncul, klik tombol bayar
                  di bawah.
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
                    <span className='font-medium'>{formatQuotaLimit(selectedPlan.max_groups)}</span>
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
      </TabsContent>

      <TabsContent value='history'>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
            <CardDescription>
              Daftar transaksi penagihan tenant, termasuk kuitansi dan pembayaran yang masih
              menunggu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingHistoryTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
