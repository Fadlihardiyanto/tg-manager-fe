import PageContainer from '@/components/layout/page-container';
import BotListing from '@/features/bots/components/bot-listing';

export const metadata = {
  title: 'Dashboard: Bot'
};

export default function BotsPage() {
  return (
    <PageContainer
      pageTitle='Bots'
      pageDescription='Kelola bot Telegram, peran, dan status koneksinya'
    >
      <BotListing />
    </PageContainer>
  );
}
