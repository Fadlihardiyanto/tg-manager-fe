import PageContainer from '@/components/layout/page-container';
import { BillingCheckoutResultPage } from '@/features/billing/components/billing-checkout-result-page';

export const metadata = {
  title: 'Dashboard: Billing Checkout Result'
};

export default function BillingCheckoutResult() {
  return (
    <PageContainer
      pageTitle='Verifikasi Checkout Billing'
      pageDescription='Cek status billing terbaru setelah Anda kembali dari alur pembayaran.'
    >
      <BillingCheckoutResultPage />
    </PageContainer>
  );
}
