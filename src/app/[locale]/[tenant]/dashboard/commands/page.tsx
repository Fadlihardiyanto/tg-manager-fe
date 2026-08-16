import PageContainer from '@/components/layout/page-container';
import CommandListing from '@/features/commands/components/command-listing';

export const metadata = {
  title: 'Dashboard: Perintah Kustom'
};

export default function CommandsPage() {
  return (
    <PageContainer
      pageTitle='Perintah'
      pageDescription='Buat perintah kustom untuk bot Telegram Anda'
    >
      <CommandListing />
    </PageContainer>
  );
}
