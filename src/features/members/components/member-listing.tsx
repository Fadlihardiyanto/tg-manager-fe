import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { membersQueryOptions } from '../api/queries';
import { MembersListingContent } from './members-listing-content';
import { MemberDetailDrawer } from './member-detail-drawer';

export default async function MemberListing() {
  const page = searchParamsCache.get('page');
  const perPage = searchParamsCache.get('perPage');
  const search = searchParamsCache.get('search') ?? undefined;
  const status = searchParamsCache.get('status') ?? undefined;
  const packageId = searchParamsCache.get('package_id') ?? undefined;

  const filters = {
    page,
    limit: perPage,
    ...(search && { search }),
    ...(status && status !== 'all' && { status }),
    ...(packageId && { package_id: packageId })
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(membersQueryOptions(filters));

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MembersListingContent />
      </HydrationBoundary>
      <Suspense fallback={null}>
        <MemberDetailDrawer />
      </Suspense>
    </>
  );
}
