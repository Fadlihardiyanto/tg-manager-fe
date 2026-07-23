import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TenantLoginForm } from './tenant-login-form';

const benefits = [
  {
    icon: Icons.creditCard,
    title: 'Pembayaran instan',
    description: 'QRIS, Virtual Account & E-Wallet'
  },
  {
    icon: Icons.shieldCheck,
    title: 'Penjaga akses otomatis',
    description: 'Keamanan grup 24/7 tanpa pengawasan'
  },
  {
    icon: Icons.chartBar,
    title: 'Analitik real-time',
    description: 'Pantau pendapatan & anggota langsung'
  }
];

export default function LoginPageLayout() {
  return (
    <div className='flex min-h-svh w-full'>
      {/* Brand Panel — desktop only */}
      <div className='hidden md:flex md:w-1/2 lg:w-[45%] relative flex-col items-center justify-center p-12 lg:p-16 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-primary/[0.02] to-primary/[0.06]' />
        <div className='absolute inset-0 bg-dot-grid opacity-[0.04]' />
        <div className='absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl' />

        <div className='relative z-10 flex flex-col items-center text-center max-w-sm'>
          <div className='mb-10'>
            <Image
              src='/uration-landscape.png'
              alt='Urator Logo'
              width={160}
              height={32}
              className='h-8 w-auto object-contain'
            />
          </div>

          <h2 className='text-2xl lg:text-3xl font-bold tracking-tight mb-3 leading-tight'>
            Kelola komunitas Telegram Anda dengan mudah
          </h2>
          <p className='text-muted-foreground text-sm lg:text-base mb-10 max-w-xs'>
            Platform all-in-one untuk monetisasi dan manajemen grup Telegram.
          </p>

          <div className='w-full space-y-5'>
            {benefits.map((item) => (
              <div key={item.title} className='flex items-start gap-3.5'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5'>
                  <item.icon className='h-4 w-4 text-primary' />
                </div>
                <div className='text-left'>
                  <p className='text-sm font-medium text-foreground'>{item.title}</p>
                  <p className='text-xs text-muted-foreground'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className='w-full md:w-1/2 lg:w-[55%] flex items-center justify-center p-4 md:p-8'>
        <div className='w-full max-w-md flex flex-col gap-4 animate-fade-up'>
          <div className='flex'>
            <Button
              asChild
              variant='ghost'
              className='text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent -ml-2'
            >
              <Link href='/'>
                <Icons.arrowLeft className='mr-2 h-4 w-4' />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>
          <div className='rounded-2xl bg-gradient-to-br from-border/80 via-border/40 to-transparent p-[1px] shadow-xl shadow-black/5'>
            <Card className='rounded-[15px] w-full p-8 md:p-10 bg-background/80 backdrop-blur-sm'>
              <TenantLoginForm />
            </Card>
          </div>
          <p className='text-sm text-center text-muted-foreground'>
            Belum punya akun?{' '}
            <Link
              href='/register-tenant'
              className='text-foreground font-semibold hover:underline transition-all'
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
