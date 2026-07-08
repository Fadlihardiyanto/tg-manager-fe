import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <main className='from-background via-background to-primary/5 flex min-h-screen items-center justify-center bg-gradient-to-b px-4 py-10'>
      <Card className='w-full max-w-2xl border-primary/15 shadow-sm'>
        <CardContent className='flex flex-col items-center gap-6 p-8 text-center sm:p-10'>
          <div className='bg-primary/10 text-primary flex h-24 w-24 items-center justify-center rounded-full'>
            <Icons.circleCheck className='h-14 w-14 animate-[spin_6s_linear_infinite]' />
          </div>

          <div className='space-y-3'>
            <div className='flex flex-wrap items-center justify-center gap-2'>
              <Badge variant='secondary'>Pembayaran Sukses</Badge>
              {tenantSlug !== '-' ? <Badge variant='outline'>{tenantSlug}</Badge> : null}
            </div>
            <h1 className='text-3xl font-semibold tracking-tight'>Pembayaran Sukses!</h1>
            <p className='text-muted-foreground max-w-xl text-sm sm:text-base'>
              Terima kasih, pembayaran Anda dengan ID transaksi{' '}
              <span className='text-foreground font-medium'>{orderId}</span> telah kami terima.
            </p>
            <p className='text-muted-foreground max-w-xl text-sm sm:text-base'>
              Kami telah mengirimkan tautan akses masuk grup khusus ke Telegram Anda secara instan.
            </p>
          </div>

          <div className='w-full max-w-xl space-y-3'>
            <Button asChild className='h-12 w-full animate-pulse text-base'>
              <a
                href={botUrl || '#'}
                target='_blank'
                rel='noreferrer'
                aria-disabled={!botUrl}
                className={!botUrl ? 'pointer-events-none opacity-50' : undefined}
              >
                <Icons.telegram className='h-5 w-5' />
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
              <Link href='/'>Kembali ke Beranda</Link>
            </Button>
            {botUrl ? (
              <Button asChild variant='ghost'>
                <a href={botUrl} target='_blank' rel='noreferrer'>
                  <Icons.externalLink className='h-4 w-4' />
                  Buka Bot di Tab Baru
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
