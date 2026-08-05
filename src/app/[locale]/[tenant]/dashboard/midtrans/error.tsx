'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function MidtransError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Midtrans Error]', error);
  }, [error]);

  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center'>
      <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
        <Icons.warning className='size-8 text-destructive' />
      </div>
      <div className='flex flex-col gap-2'>
        <h2 className='text-xl font-bold tracking-tight'>Gagal memuat pengaturan Midtrans</h2>
        <p className='max-w-md text-sm text-muted-foreground'>
          {error.message || 'Terjadi kesalahan. Silakan coba lagi.'}
        </p>
      </div>
      <Button onClick={reset} variant='outline'>
        <Icons.refresh className='mr-2 size-4' />
        Coba lagi
      </Button>
    </div>
  );
}
