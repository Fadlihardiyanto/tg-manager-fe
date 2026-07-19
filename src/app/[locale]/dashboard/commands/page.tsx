import PageContainer from '@/components/layout/page-container';
import CommandListing from '@/features/commands/components/command-listing';

export const metadata = {
  title: 'Dashboard: Perintah Kustom'
};

export default function CommandsPage() {
  return (
    <PageContainer pageTitle='Custom Commands'>
      <CommandListing />
    </PageContainer>
  );
}
