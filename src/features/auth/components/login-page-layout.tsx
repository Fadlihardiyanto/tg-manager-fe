import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TenantLoginForm } from './tenant-login-form';

const STATS = [
  { label: 'Bot', value: '3', accent: 'from-blue-500' },
  { label: 'Aktif', value: '2', accent: 'from-emerald-500' },
  { label: 'Grup', value: '5', accent: 'from-cyan-500' },
  { label: 'Member', value: '142', accent: 'from-amber-500' }
];

function Showcase() {
  return (
    <div className='w-full space-y-3'>
      {/* Mini stat row */}
      <div className='grid grid-cols-4 gap-2.5'>
        {STATS.map((s) => (
          <div
            key={s.label}
            className='flex flex-col gap-1.5 rounded-xl border border-border/40 bg-card/80 p-3 shadow-sm shadow-primary/3'
          >
            <div
              className={cn(
                'h-0.5 w-full rounded-full bg-gradient-to-r to-transparent opacity-60',
                s.accent
              )}
            />
            <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>
              {s.label}
            </span>
            <span className='text-lg font-bold tabular-nums text-foreground'>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Mini bot card */}
      <div className='overflow-hidden rounded-xl border border-border/40 bg-card/80 shadow-md shadow-primary/5'>
        <div className='h-1.5 bg-gradient-to-r from-sky-400 to-sky-500' />
        <div className='flex items-center gap-3 p-4'>
          <div className='relative shrink-0'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'>
              <Icons.bot className='size-5 text-primary' />
            </div>
            <span className='absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500' />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold truncate text-foreground'>@premiumBot</p>
            <p className='text-[11px] text-muted-foreground'>ID: 7555666777</p>
          </div>
          <div className='ml-auto flex shrink-0 flex-col items-end gap-1.5'>
            <div className='flex gap-1.5'>
              <span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 border border-emerald-500/20'>
                Aktif
              </span>
              <span className='rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 border border-sky-500/20'>
                Sales
              </span>
            </div>
            <span className='inline-flex items-center gap-1 rounded-md bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground'>
              <Icons.groups className='size-3' />
              <span className='font-medium text-foreground tabular-nums'>3</span> grup
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageLayout() {
  return (
    <div className='flex min-h-svh w-full'>
      {/* Brand Panel — desktop only */}
      <div className='hidden md:flex md:w-1/2 lg:w-[45%] relative flex-col items-center justify-center p-12 lg:p-16 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.1] via-primary/[0.04] to-primary/[0.12]' />

        <div className='relative z-10 flex flex-col items-center text-center max-w-sm'>
          <div className='mb-10'>
            <Image
              src='/uration-landscape.png'
              alt='Urator Logo'
              width={96}
              height={32}
              className='h-8 w-auto object-contain drop-shadow-sm'
            />
          </div>

          <h2 className='text-2xl lg:text-3xl font-bold tracking-tight mb-3 leading-tight'>
            Kelola komunitas Telegram dengan mudah
          </h2>
          <p className='text-muted-foreground text-sm lg:text-base mb-8 max-w-xs'>
            Platform all-in-one untuk monetisasi & akses grup Telegram.
          </p>

          <Showcase />
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

          <Card className='rounded-xl w-full p-6 md:p-8'>
            <TenantLoginForm />
          </Card>

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
