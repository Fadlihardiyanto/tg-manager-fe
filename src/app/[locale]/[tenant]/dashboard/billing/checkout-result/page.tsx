import PageContainer from '@/components/layout/page-container';
import { BillingCheckoutResultPage } from '@/features/billing/components/billing-checkout-result-page';

export const metadata = {
  title: 'Dashboard: Hasil Checkout Billing'
};

export default function BillingCheckoutResult() {
  return (
    <PageContainer pageTitle='Verifikasi Checkout Billing'>
      <BillingCheckoutResultPage />
    </PageContainer>
  );
}
