import PageContainer from '@/components/layout/page-container';
import BotListing from '@/features/bots/components/bot-listing';

export const metadata = {
  title: 'Dashboard: Bots'
};

export default function BotsPage() {
  return (
    <PageContainer
      pageTitle='Telegram Bots'
      pageDescription='Manage your Telegram bots — register, configure roles, and control status.'
    >
      <BotListing />
    </PageContainer>
  );
}
