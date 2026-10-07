import PageContainer from '@/components/layout/page-container';
import { BroadcastListingContent } from '@/features/broadcast/components/broadcast-listing-content';

export const metadata = {
  title: 'Dashboard: Siaran'
};

export default function BroadcastPage() {
  return (
    <PageContainer pageTitle='Siaran'>
      <BroadcastListingContent />
    </PageContainer>
  );
}
