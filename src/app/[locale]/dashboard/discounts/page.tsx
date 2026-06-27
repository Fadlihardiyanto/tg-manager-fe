import PageContainer from '@/components/layout/page-container';
import DiscountListing from '@/features/discounts/components/discount-listing';

export const metadata = {
  title: 'Dashboard: Discounts'
};

export default function DiscountsPage() {
  return (
    <PageContainer
      pageTitle='Member Discounts'
      pageDescription='Create and manage promo codes for your subscription packages — set type, value, usage limits, and validity period.'
    >
      <DiscountListing />
    </PageContainer>
  );
}
