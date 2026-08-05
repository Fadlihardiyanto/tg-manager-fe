import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicCheckoutPage } from '@/features/checkout/components/public-checkout-page';

export const metadata = {
  title: 'Checkout Pembayaran'
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Skeleton className='mx-auto h-[400px] w-full max-w-4xl' />}>
      <PublicCheckoutPage />
    </Suspense>
  );
}
