import PageContainer from '@/components/layout/page-container';
import DiscountListing from '@/features/discounts/components/discount-listing';

export const metadata = {
  title: 'Dashboard: Diskon'
};

export default function DiscountsPage() {
  return (
    <PageContainer pageTitle='Discounts'>
      <DiscountListing />
    </PageContainer>
  );
}
