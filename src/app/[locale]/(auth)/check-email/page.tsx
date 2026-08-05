import { Suspense } from 'react';
import { Metadata } from 'next';
import CheckEmailClient from '@/features/auth/components/check-email-client';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Periksa Email Anda - Urator',
  description: 'Verifikasi alamat email Anda untuk menyelesaikan pendaftaran.'
};

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className='flex h-svh items-center justify-center bg-background'>
          <div className='flex flex-col items-center gap-4'>
            <Icons.spinner className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>Memuat...</p>
          </div>
        </div>
      }
    >
      <CheckEmailClient />
    </Suspense>
  );
}
