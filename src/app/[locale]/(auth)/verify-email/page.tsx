import { Suspense } from 'react';
import type { Metadata } from 'next';
import VerifyEmailClient from '@/features/auth/components/verify-email-client';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Verifikasi Email - Urator',
  description: 'Verifikasi alamat email Anda untuk mengaktifkan akun.'
};

export default function VerifyEmailPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <Suspense
        fallback={
          <div className='flex flex-col items-center gap-4'>
            <Icons.spinner className='h-8 w-8 animate-spin text-primary' />
            <p className='text-muted-foreground text-sm'>Memuat...</p>
          </div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
