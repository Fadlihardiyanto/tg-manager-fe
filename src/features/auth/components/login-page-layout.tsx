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
        {/* Enhanced gradient background */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-primary/[0.12]' />
        <div className='absolute inset-0 bg-dot-grid opacity-[0.06]' />

        {/* Animated orbs */}
        <div className='absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/8 blur-3xl animate-pulse delay-1000' />

        {/* Decorative grid lines */}
        <div className='absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03]' />

        <div className='relative z-10 flex flex-col items-center text-center max-w-sm'>
          <div className='mb-10 animate-float-y'>
            <Image
              src='/uration-landscape.png'
              alt='Urator Logo'
              width={160}
              height={32}
              className='h-8 w-auto object-contain drop-shadow-sm'
            />
          </div>

          <h2 className='text-2xl lg:text-3xl font-bold tracking-tight mb-3 leading-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent'>
            Kelola komunitas Telegram Anda dengan mudah
          </h2>
          <p className='text-muted-foreground text-sm lg:text-base mb-10 max-w-xs'>
            Platform all-in-one untuk monetisasi dan manajemen grup Telegram.
          </p>

          <div className='w-full space-y-5'>
            {benefits.map((item, index) => (
              <div
                key={item.title}
                className='group flex items-start gap-3.5 rounded-xl p-2 -ml-2 transition-all hover:bg-primary/5 hover:scale-[1.02]'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 shrink-0 mt-0.5 ring-1 ring-primary/20 transition-all group-hover:ring-primary/40 group-hover:scale-110'>
                  <item.icon className='h-4 w-4 text-primary transition-transform group-hover:scale-110' />
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
              className='text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent -ml-2 group'
            >
              <Link href='/'>
                <Icons.arrowLeft className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1' />
                Kembali ke Beranda
              </Link>
            </Button>
          </div>

          {/* Enhanced card with gradient border */}
          <div className='rounded-2xl bg-gradient-to-br from-primary/20 via-border/50 to-primary/10 p-[1px] shadow-2xl shadow-primary/5 transition-shadow hover:shadow-primary/10'>
            <Card className='rounded-[15px] w-full p-8 md:p-10 bg-background/90 backdrop-blur-xl'>
              <TenantLoginForm />
            </Card>
          </div>

          <p className='text-sm text-center text-muted-foreground'>
            Belum punya akun?{' '}
            <Link
              href='/register-tenant'
              className='text-primary font-semibold hover:underline transition-all underline-offset-4'
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
