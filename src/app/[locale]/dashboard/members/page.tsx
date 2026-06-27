import PageContainer from '@/components/layout/page-container';
import MemberListing from '@/features/members/components/member-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Members | Dashboard'
};

type PageProps = { searchParams: Promise<SearchParams> };

export default async function MembersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Members'
      pageDescription='Manage and view your tenant members and their subscriptions.'
    >
      <MemberListing />
    </PageContainer>
  );
}
