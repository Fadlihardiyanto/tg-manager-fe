import PageContainer from '@/components/layout/page-container';
import BotListing from '@/features/bots/components/bot-listing';

export const metadata = {
  title: 'Dashboard: Bot'
};

export default function BotsPage() {
  return (
    <PageContainer
      pageTitle='Bot Telegram'
      pageDescription='Kelola bot Telegram Anda, mulai dari pendaftaran, pengaturan peran, hingga status aktif.'
    >
      <BotListing />
    </PageContainer>
  );
}
