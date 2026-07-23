'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function CheckoutSuccessError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Checkout Success Error]', error);
  }, [error]);

  return (
    <main className='flex min-h-screen items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
          <Icons.warning className='size-8 text-destructive' />
        </div>
        <h2 className='text-xl font-bold'>Gagal memuat halaman</h2>
        <p className='max-w-md text-sm text-muted-foreground'>
          {error.message || 'Terjadi kesalahan. Silakan coba lagi.'}
        </p>
        <Button onClick={reset} variant='outline'>
          <Icons.refresh className='mr-2 size-4' />
          Coba lagi
        </Button>
      </div>
    </main>
  );
}
