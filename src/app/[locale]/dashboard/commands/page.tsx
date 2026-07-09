import PageContainer from '@/components/layout/page-container';
import CommandListing from '@/features/commands/components/command-listing';

export const metadata = {
  title: 'Dashboard: Perintah Kustom'
};

export default function CommandsPage() {
  return (
    <PageContainer
      pageTitle='Perintah Kustom'
      pageDescription='Buat dan kelola perintah kustom untuk respon otomatis bot Telegram.'
    >
      <CommandListing />
    </PageContainer>
  );
}
