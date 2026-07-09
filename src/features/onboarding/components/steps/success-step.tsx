'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function SuccessStep() {
  const router = useRouter();

  return (
    <div className='flex flex-col items-center justify-center gap-6 py-12 text-center'>
      <div className='relative'>
        <div className='flex size-20 animate-in items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5 zoom-in-50 duration-500'>
          <Icons.circleCheck className='size-10 animate-in text-emerald-500 zoom-in-0 duration-700 delay-200' />
        </div>
        <Icons.confetti className='absolute -right-3 -top-2 size-5 animate-float-y text-amber-400' />
        <Icons.sparkles className='absolute -bottom-1 -left-4 size-4 animate-float-y-delay-1 text-primary' />
        <Icons.rocket className='absolute -left-2 -top-3 size-4 animate-float-y-delay-2 text-sky-400' />
      </div>

      <div className='flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300'>
        <h3 className='text-2xl font-bold tracking-tight'>Semua Sudah Siap!</h3>
        <p className='mx-auto max-w-sm text-muted-foreground'>
          Workspace Anda telah berhasil dikonfigurasi. Mulai kelola komunitas Telegram Anda dengan
          TG-Manager sekarang.
        </p>
      </div>

      <div className='flex w-full max-w-xs flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500'>
        <Button size='lg' className='w-full' onClick={() => router.push('/dashboard/overview')}>
          <Icons.dashboard />
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}
