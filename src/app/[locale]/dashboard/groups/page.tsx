import PageContainer from '@/components/layout/page-container';
import GroupListing from '@/features/groups/components/group-listing';

export const metadata = {
  title: 'Dashboard: Groups'
};

export default function GroupsPage() {
  return (
    <PageContainer
      pageTitle='Telegram Groups'
      pageDescription='Manage your Telegram groups — register, assign bots, and monitor member counts.'
    >
      <GroupListing />
    </PageContainer>
  );
}
