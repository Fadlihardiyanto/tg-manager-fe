import PageContainer from '@/components/layout/page-container';
import { BroadcastListingContent } from '@/features/broadcast/components/broadcast-listing-content';

export const metadata = {
  title: 'Dashboard: Broadcast'
};

export default function BroadcastPage() {
  return (
    <PageContainer
      pageTitle='Broadcast'
      pageDescription='Kirim pesan massal ke grup atau member Telegram.'
    >
      <BroadcastListingContent />
    </PageContainer>
  );
}
