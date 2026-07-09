import PageContainer from '@/components/layout/page-container';
import DiscountListing from '@/features/discounts/components/discount-listing';

export const metadata = {
  title: 'Dashboard: Diskon'
};

export default function DiscountsPage() {
  return (
    <PageContainer
      pageTitle='Diskon Member'
      pageDescription='Buat dan kelola kode promo untuk paket langganan Anda, termasuk jenis, nilai, batas penggunaan, dan masa berlaku.'
    >
      <DiscountListing />
    </PageContainer>
  );
}
