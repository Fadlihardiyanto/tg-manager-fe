import PageContainer from '@/components/layout/page-container';
import GroupListing from '@/features/groups/components/group-listing';

export const metadata = {
  title: 'Dashboard: Grup'
};

export default function GroupsPage() {
  return (
    <PageContainer
      pageTitle='Grup Telegram'
      pageDescription='Kelola grup Telegram Anda, mulai dari pendaftaran, penugasan bot, hingga pantauan jumlah member.'
    >
      <GroupListing />
    </PageContainer>
  );
}
