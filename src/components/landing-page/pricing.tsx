import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CircleCheck, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

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

const Pricing = async () => {
  const t = await getTranslations('Pricing');
  let plans: PlatformPlan[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/v1/public/plans`, {
      cache: 'no-store' // Disable cache to always get the latest array order
    });

    if (res.ok) {
      const json: PlansResponse = await res.json();
      if (json?.data) {
        plans = json.data.filter((p) => p.is_active && p.is_landing_page);
      }
    }
  } catch (error) {
    console.error('Gagal mengambil paket publik dari API:', error);
  }

  // Fallback mock data if API is unreachable or returns empty
  if (plans.length === 0) {
    plans = [
      {
        id: '1',
        name: 'free',
        display_name: 'Gratis',
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
        max_bots: -1, // Unlimited
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
  }

  return (
    <div id='pricing' className='max-w-(--breakpoint-2xl) mx-auto py-12 xs:py-20 px-4 sm:px-6'>
      <div className='text-center max-w-2xl mx-auto'>
        <h1 className='text-4xl xs:text-5xl font-semibold tracking-tight'>{t('header')}</h1>
        <p className='mt-4 text-lg text-muted-foreground'>{t('subHeader')}</p>
      </div>

      <div className='mt-12 xs:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-start gap-4 lg:gap-6 justify-center w-full'>
        {plans.map((plan, index) => {
          const isPopular = plan.name.toLowerCase().includes('growth') || index === 2;

          return (
            <div
              key={plan.id}
              className={cn('relative bg-accent/50 border p-6 rounded-2xl flex flex-col h-full', {
                'bg-background border-[2px] border-primary shadow-lg xl:-my-4 xl:py-10': isPopular
              })}
            >
              {isPopular && (
                <Badge className='absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-0.5 text-xs'>
                  {t('mostPopular')}
                </Badge>
              )}

              <div className='mb-4 h-24'>
                <h3 className='text-xl font-bold'>{plan.display_name}</h3>
                <div className='mt-3 flex items-baseline text-3xl font-extrabold tracking-tight whitespace-nowrap'>
                  {Number(plan.price_monthly) === 0 ? t('free') : formatRupiah(plan.price_monthly)}
                </div>
                <span className='text-sm font-medium text-muted-foreground block mt-1'>
                  {t('perMonth')}
                </span>
              </div>

              <Separator className='mb-5' />

              <ul className='mb-6 flex-1 text-sm'>
                {(() => {
                  const featuresList = Array.isArray(plan.features)
                    ? plan.features
                    : Object.entries(plan.features || {}).map(([name, included]) => ({
                        name,
                        included: Boolean(included)
                      }));

                  return featuresList.map((feature, idx) => (
                    <li key={idx} className='flex items-start gap-2.5 min-h-[2.75rem]'>
                      {feature.included ? (
                        <CircleCheck className='h-4 w-4 mt-0.5 text-green-500 shrink-0' />
                      ) : (
                        <X className='h-4 w-4 mt-0.5 text-red-500 shrink-0' />
                      )}
                      <span
                        className={cn(
                          'leading-tight',
                          feature.included
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground/60 line-through'
                        )}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ));
                })()}
              </ul>

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
        })}
      </div>
    </div>
  );
};

export default Pricing;
