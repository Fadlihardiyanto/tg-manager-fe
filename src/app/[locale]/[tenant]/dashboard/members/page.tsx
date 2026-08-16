import PageContainer from '@/components/layout/page-container';
import MemberListing from '@/features/members/components/member-listing';
import MigrationMemberListing from '@/features/migration-members/components/migration-member-listing';
import { MembersPageTabs } from '@/features/migration-members/components/members-page-tabs';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Member - Urator'
};

type PageProps = { searchParams: Promise<SearchParams> };

export default async function MembersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const parsed = searchParamsCache.parse(searchParams);
  const activeTab = parsed.tab === 'migration' ? 'migration' : 'active';

  return (
    <PageContainer pageTitle='Member' pageDescription='Kelola anggota grup dan langganan mereka'>
      <div className='flex flex-1 flex-col gap-4 min-h-0'>
        <MembersPageTabs />
        {activeTab === 'migration' ? <MigrationMemberListing /> : <MemberListing />}
      </div>
    </PageContainer>
  );
}
