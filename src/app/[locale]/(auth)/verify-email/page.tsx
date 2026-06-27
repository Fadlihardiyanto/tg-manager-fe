import { Suspense } from 'react';
import VerifyEmailClient from '@/features/auth/components/verify-email-client';
import { Icons } from '@/components/icons';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense 
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </div>
  );
}
