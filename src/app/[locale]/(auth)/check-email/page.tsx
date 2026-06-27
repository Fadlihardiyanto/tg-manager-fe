import { Suspense } from 'react';
import { Metadata } from 'next';
import CheckEmailClient from '@/features/auth/components/check-email-client';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Check Your Email - TeleCommand',
  description: 'Verify your email address to complete registration.'
};

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className='flex h-svh items-center justify-center bg-background'>
          <div className='flex flex-col items-center gap-4'>
            <Icons.spinner className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>Loading...</p>
          </div>
        </div>
      }
    >
      <CheckEmailClient />
    </Suspense>
  );
}
