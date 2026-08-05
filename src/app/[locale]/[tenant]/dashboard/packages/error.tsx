'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function PackagesError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Packages error boundary caught:', error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center'>
      <div className='flex size-12 items-center justify-center rounded-full bg-destructive/10'>
        <Icons.warning className='size-6 text-destructive' />
      </div>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold text-foreground'>Gagal memuat paket</h2>
        <p className='text-sm text-muted-foreground'>
          {error.message || 'Terjadi kesalahan saat mengambil data paket. Silakan coba lagi.'}
        </p>
      </div>
      <Button variant='outline' onClick={reset} className='rounded-full'>
        <Icons.refresh className='mr-2 h-4 w-4' />
        Coba Lagi
      </Button>
    </div>
  );
}
