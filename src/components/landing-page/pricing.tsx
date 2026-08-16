'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Icons } from '@/components/icons';
import { Modal } from '@/components/ui/modal';

export interface PlatformPlanFeature {
  name: string;
  included: boolean;
}

export interface PlatformPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number | string;
  price_yearly: number | string;
  max_bots: number;
  max_groups: number;
  max_packages: number;
  max_members: number;
  max_custom_commands: number;
  features: PlatformPlanFeature[] | Record<string, boolean>;
  is_active: boolean;
  is_landing_page: boolean;
}

interface PlansResponse {
  meta: {
    success: boolean;
    message: string;
  };
  data: PlatformPlan[];
}

const formatRupiah = (amount: number | string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount));
};

const planNameMap: Record<string, string> = {
  free: 'Gratis',
  starter: 'Pemula',
  growth: 'Berkembang',
  scale: 'Skala'
};

const INCLUDED_PREVIEW_COUNT = 5;

const fallbackPlans: PlatformPlan[] = [
  {
    id: '1',
    name: 'free',
    display_name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    max_bots: 1,
    max_groups: 1,
    max_packages: 1,
    max_members: 50,
    max_custom_commands: 0,
    features: [
      { name: 'Bot Telegram Otomatis 24/7 (Bot Bersama)', included: true },
      { name: 'Dashboard Admin & CRM Lengkap', included: true },
      { name: 'Pembayaran Otomatis di Dalam Bot (QRIS/VA)', included: true },
      { name: '1 Paket Langganan Aktif', included: true },
      { name: 'Maksimal 50 Member Aktif', included: true },
      { name: 'Kelola 1 Grup/Channel Premium', included: true },
      { name: '0% Biaya Platform & Tanpa Biaya Admin Tersembunyi', included: true },
      { name: 'Volume Transaksi Maksimal Rp 500 ribu / Bulan', included: true },
      { name: 'Laporan Transaksi & Ekspor Excel', included: false },
      { name: 'Perintah Bot Kustom (Teks & Gambar)', included: false },
      { name: 'Dukungan Token Bot Pribadi (@BotFather)', included: false },
      { name: 'Sistem Voucher Dinamis & Kupon Diskon', included: false },
      { name: 'Sistem Broadcast Massal (Teks & Gambar)', included: false },
      { name: 'Broadcast Media Lanjutan', included: false },
      { name: 'Pemrosesan Prioritas Tinggi', included: false }
    ],
    is_active: true,
    is_landing_page: true
  },
  {
    id: '2',
    name: 'starter',
    display_name: 'Pemula',
    price_monthly: 99000,
    price_yearly: 990000,
    max_bots: 1,
    max_groups: 3,
    max_packages: 5,
    max_members: 500,
    max_custom_commands: 5,
    features: [
      { name: 'Bot Telegram Otomatis 24/7 (Bot Bersama)', included: true },
      { name: 'Dashboard Admin & CRM Lengkap', included: true },
      { name: 'Pembayaran Otomatis di Dalam Bot (QRIS/VA)', included: true },
      { name: '5 Paket Langganan Aktif', included: true },
      { name: 'Maksimal 500 Member Aktif', included: true },
      { name: 'Kelola 3 Grup/Channel Premium', included: true },
      { name: '0% Biaya Platform & Tanpa Biaya Admin Tersembunyi', included: true },
      { name: 'Volume Transaksi Maksimal Rp 5 juta / Bulan', included: true },
      { name: 'Laporan Transaksi & Ekspor Excel', included: false },
      { name: 'Perintah Bot Kustom (Teks & Gambar)', included: true },
      { name: 'Dukungan Token Bot Pribadi (@BotFather)', included: false },
      { name: 'Sistem Voucher Dinamis & Kupon Diskon', included: false },
      { name: 'Sistem Broadcast Massal (Teks & Gambar)', included: false },
      { name: 'Broadcast Media Lanjutan', included: false },
      { name: 'Pemrosesan Prioritas Tinggi', included: false }
    ],
    is_active: true,
    is_landing_page: true
  },
  {
    id: '3',
    name: 'growth',
    display_name: 'Berkembang',
    price_monthly: 199000,
    price_yearly: 1990000,
    max_bots: 3,
    max_groups: 10,
    max_packages: 15,
    max_members: 5000,
    max_custom_commands: 20,
    features: [
      { name: 'Bot Telegram Otomatis 24/7 (Hingga 3 Bot Pribadi)', included: true },
      { name: 'Dashboard Admin & CRM Lengkap', included: true },
      { name: 'Pembayaran Otomatis di Dalam Bot (QRIS/VA)', included: true },
      { name: 'Manajemen Paket Langganan Tanpa Batas', included: true },
      { name: 'Member Aktif Tak Terbatas', included: true },
      { name: 'Grup & Channel Premium Tanpa Batas', included: true },
      { name: '0% Biaya Platform & Tanpa Biaya Admin Tersembunyi', included: true },
      { name: 'Volume Transaksi Bulanan Tanpa Batas', included: true },
      { name: 'Laporan Transaksi & Ekspor Excel', included: true },
      { name: 'Perintah Bot Kustom (Teks & Gambar)', included: true },
      { name: 'Dukungan Token Bot Pribadi (@BotFather)', included: true },
      { name: 'Sistem Voucher Dinamis & Kupon Diskon', included: true },
      { name: 'Sistem Broadcast Massal (Teks & Gambar)', included: true },
      { name: 'Broadcast Media Lanjutan', included: true },
      { name: 'Pemrosesan Prioritas Tinggi', included: true }
    ],
    is_active: true,
    is_landing_page: true
  },
  {
    id: '4',
    name: 'scale',
    display_name: 'Skala',
    price_monthly: 499000,
    price_yearly: 4990000,
    max_bots: -1,
    max_groups: -1,
    max_packages: -1,
    max_members: -1,
    max_custom_commands: -1,
    features: [
      { name: 'Bot Telegram Otomatis 24/7 (Bot Tanpa Batas)', included: true },
      { name: 'Dashboard Admin & CRM Lengkap', included: true },
      { name: 'Pembayaran Otomatis di Dalam Bot (QRIS/VA)', included: true },
      { name: 'Manajemen Paket Langganan Tanpa Batas', included: true },
      { name: 'Member Aktif Tak Terbatas', included: true },
      { name: 'Grup & Channel Premium Tanpa Batas', included: true },
      { name: '0% Biaya Platform & Tanpa Biaya Admin Tersembunyi', included: true },
      { name: 'Volume Transaksi Bulanan Tanpa Batas', included: true },
      { name: 'Laporan Transaksi & Ekspor Excel', included: true },
      { name: 'Perintah Bot Kustom (Teks & Gambar)', included: true },
      { name: 'Dukungan Token Bot Pribadi (@BotFather)', included: true },
      { name: 'Sistem Voucher Dinamis & Kupon Diskon', included: true },
      { name: 'Sistem Broadcast Massal (Teks & Gambar)', included: true },
      { name: 'Broadcast Media Lanjutan', included: true },
      { name: 'Pemrosesan Prioritas Utama', included: true }
    ],
    is_active: true,
    is_landing_page: true
  }
];

const PricingSkeleton = () => (
  <div className='mt-12 xs:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-4 lg:gap-6 justify-center w-full'>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className='bg-accent/50 border p-6 rounded-2xl flex flex-col'>
        <Skeleton className='h-6 w-24 mb-4' />
        <Skeleton className='h-8 w-32 mb-3' />
        <Skeleton className='h-4 w-16 mb-6' />
        <Skeleton className='h-px w-full mb-5' />
        <div className='space-y-3 mb-6 flex-1'>
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} className='h-5 w-full' />
          ))}
        </div>
        <Skeleton className='h-10 w-full rounded-xl' />
      </div>
    ))}
  </div>
);

const Pricing = () => {
  const t = useTranslations('Pricing');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [detailPlan, setDetailPlan] = useState<PlatformPlan | null>(null);

  const {
    data: apiPlans,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/v1/public/plans`, {
        cache: 'no-store'
      });
      if (!res.ok) throw new Error('Gagal memuat paket harga');
      const json: PlansResponse = await res.json();
      return (json?.data || []).filter((p: PlatformPlan) => p.is_active && p.is_landing_page);
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  const isEmpty = !apiPlans || apiPlans.length === 0;
  const displayPlans = isEmpty ? fallbackPlans : apiPlans;

  return (
    <div id='pricing' className='max-w-(--breakpoint-2xl) mx-auto py-20 lg:py-24 px-4 sm:px-6'>
      <div className='text-center max-w-2xl mx-auto'>
        <h2 className='text-4xl xs:text-5xl font-semibold tracking-tight text-balance'>
          {t('header')}
        </h2>
        <p className='mt-4 text-lg text-muted-foreground'>{t('subHeader')}</p>

        <div className='mt-8 inline-flex items-center gap-2 rounded-full border bg-accent/50 p-1'>
          <button
            onClick={() => setBilling('monthly')}
            aria-pressed={billing === 'monthly'}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              billing === 'monthly'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setBilling('yearly')}
            aria-pressed={billing === 'yearly'}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              billing === 'yearly'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {t('yearly')}
          </button>
        </div>
      </div>

      {isError && (
        <div className='mt-4 mx-auto max-w-md flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
          <Icons.warning className='h-4 w-4 shrink-0' />
          <span className='flex-1'>{t('error')}</span>
          <Button variant='ghost' size='sm' className='h-7 px-2 text-xs' onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <PricingSkeleton />
      ) : (
        <div className='mt-12 xs:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-4 lg:gap-6 justify-center w-full'>
          {displayPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPopular={index === 2}
              billing={billing}
              onShowAll={() => setDetailPlan(plan)}
            />
          ))}
        </div>
      )}

      {detailPlan && (
        <Modal
          title={planNameMap[detailPlan.name] ?? detailPlan.display_name}
          description={t('allFeatures')}
          isOpen
          onClose={() => setDetailPlan(null)}
        >
          <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm'>
            {normalizeFeatures(detailPlan).map((feature, idx) => (
              <li key={idx} className='flex items-start gap-2.5 py-1.5'>
                {feature.included ? (
                  <Icons.circleCheck className='h-4 w-4 mt-0.5 text-green-500 shrink-0' />
                ) : (
                  <Icons.close className='h-4 w-4 mt-0.5 text-muted-foreground/60 shrink-0' />
                )}
                <span
                  className={cn(
                    'leading-tight',
                    feature.included ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
};

const PlanCard = ({
  plan,
  isPopular,
  billing,
  onShowAll
}: {
  plan: PlatformPlan;
  isPopular: boolean;
  billing: 'monthly' | 'yearly';
  onShowAll: () => void;
}) => {
  const t = useTranslations('Pricing');

  const price = billing === 'yearly' ? Number(plan.price_yearly) : Number(plan.price_monthly);
  const planLabel = planNameMap[plan.name] ?? plan.display_name;

  const featuresList = normalizeFeatures(plan);
  const includedFeatures = featuresList.filter((f) => f.included);
  const visibleFeatures = includedFeatures.slice(0, INCLUDED_PREVIEW_COUNT);
  const hasMore = featuresList.length > INCLUDED_PREVIEW_COUNT;
  const hiddenCount = featuresList.length - INCLUDED_PREVIEW_COUNT;

  return (
    <div
      className={cn(
        'relative bg-accent/50 border p-6 rounded-2xl flex flex-col h-full transition-colors',
        {
          'bg-background border-2 border-primary shadow-lg xl:-my-4 xl:py-10': isPopular
        }
      )}
    >
      {isPopular && (
        <Badge className='absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-0.5 text-xs bg-primary'>
          {t('mostPopular')}
        </Badge>
      )}

      <div className='mb-4 h-24'>
        <h3 className='text-xl font-bold'>{planLabel}</h3>
        <div className='mt-3 flex items-baseline text-3xl font-extrabold tracking-tight whitespace-nowrap tabular-nums'>
          {price === 0 ? t('free') : formatRupiah(price)}
        </div>
        <span className='text-sm font-medium text-muted-foreground block mt-1'>
          {billing === 'yearly' ? t('perYear') : t('perMonth')}
        </span>
      </div>

      <Separator className='mb-5' />

      <ul className='mb-4 flex-1 text-sm'>
        {visibleFeatures.map((feature, idx) => (
          <li key={idx} className='flex items-start gap-2.5 min-h-[2.75rem]'>
            {feature.included ? (
              <Icons.circleCheck className='h-4 w-4 mt-0.5 text-green-500 shrink-0' />
            ) : (
              <Icons.close className='h-4 w-4 mt-0.5 text-muted-foreground/60 shrink-0' />
            )}
            <span
              className={cn(
                'leading-tight',
                feature.included ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type='button'
          onClick={onShowAll}
          className='mb-5 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline self-start'
        >
          {t('showAllFeatures', { count: hiddenCount })}
          <Icons.eye className='h-4 w-4' aria-hidden='true' />
        </button>
      )}

      <Button
        variant={isPopular ? 'default' : 'outline'}
        size='sm'
        className='w-full rounded-xl h-10 mt-auto'
        asChild
      >
        <Link href='/register-tenant'>{t('getStarted')}</Link>
      </Button>
    </div>
  );
};

const normalizeFeatures = (plan: PlatformPlan): PlatformPlanFeature[] =>
  Array.isArray(plan.features)
    ? plan.features
    : Object.entries(plan.features || {}).map(([name, included]) => ({
        name,
        included: Boolean(included)
      }));

export default Pricing;
