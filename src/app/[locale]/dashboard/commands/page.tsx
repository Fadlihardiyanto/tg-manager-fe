import PageContainer from '@/components/layout/page-container';
import CommandListing from '@/features/commands/components/command-listing';

export const metadata = {
  title: 'Dashboard: Custom Commands'
};

export default function CommandsPage() {
  return (
    <PageContainer
      pageTitle='Custom Commands'
      pageDescription='Buat dan kelola perintah kustom untuk respon otomatis bot Telegram.'
    >
      <CommandListing />
    </PageContainer>
  );
}
