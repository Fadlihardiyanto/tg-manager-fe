import PageContainer from '@/components/layout/page-container';
import GroupListing from '@/features/groups/components/group-listing';

export const metadata = {
  title: 'Dashboard: Grup'
};

export default function GroupsPage() {
  return (
    <PageContainer pageTitle='Groups' pageDescription='Kelola grup Telegram dan koneksi bot'>
      <GroupListing />
    </PageContainer>
  );
}
