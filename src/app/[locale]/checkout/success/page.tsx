import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

type PageProps = {
  searchParams: Promise<{
    order_id?: string;
    bot?: string;
    slug?: string;
  }>;
};

function sanitizeBotUsername(value?: string) {
  return (value || '').replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '');
}

export const metadata = {
  title: 'Checkout Success'
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.order_id || '-';
  const tenantSlug = params.slug || '-';
  const botUsername = sanitizeBotUsername(params.bot);
  const botUrl = botUsername ? `https://t.me/${botUsername}` : '';

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.04),transparent_50%)]' />

      <div className='w-full max-w-2xl animate-fade-up'>
        <div className='flex flex-col items-center gap-6 text-center'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl' />
            <div className='bg-emerald-500/10 text-emerald-600 relative flex size-24 items-center justify-center rounded-full ring-8 ring-background'>
              <Icons.circleCheck className='size-14' />
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex flex-wrap items-center justify-center gap-2'>
              <Badge className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border'>
                Pembayaran Sukses
              </Badge>
              {tenantSlug !== '-' ? <Badge variant='outline'>{tenantSlug}</Badge> : null}
            </div>
            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Pembayaran Sukses!</h1>
            <p className='text-muted-foreground mx-auto max-w-xl text-sm sm:text-base'>
              Terima kasih, pembayaran Anda dengan ID transaksi{' '}
              <span className='text-foreground font-medium'>{orderId}</span> telah kami terima.
            </p>
            <p className='text-muted-foreground mx-auto max-w-xl text-sm sm:text-base'>
              Kami telah mengirimkan tautan akses masuk grup khusus ke Telegram Anda secara instan.
            </p>
          </div>

          <div className='w-full max-w-xl space-y-3'>
            <Button asChild className='h-13 w-full rounded-full text-base'>
              <a
                href={botUrl || '#'}
                target='_blank'
                rel='noreferrer'
                aria-disabled={!botUrl}
                className={!botUrl ? 'pointer-events-none opacity-50' : undefined}
              >
                <Icons.telegram className='size-5' />
                Buka Aplikasi Telegram untuk Akses Grup
              </a>
            </Button>

            <p className='text-muted-foreground text-xs sm:text-sm'>
              Jika aplikasi Telegram tidak terbuka, silakan cari username bot{' '}
              <span className='text-foreground font-medium'>
                {botUsername ? `@${botUsername}` : '-'}
              </span>{' '}
              di kolom pencarian aplikasi Telegram Anda.
            </p>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-3'>
            <Button asChild variant='outline'>
              <Link href='/'>
                <Icons.arrowLeft className='size-4' />
                Kembali ke Beranda
              </Link>
            </Button>
            {botUrl ? (
              <Button asChild variant='ghost'>
                <a href={botUrl} target='_blank' rel='noreferrer'>
                  <Icons.externalLink className='size-4' />
                  Buka Bot di Tab Baru
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
