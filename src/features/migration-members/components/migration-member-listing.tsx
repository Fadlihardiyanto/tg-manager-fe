import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { migrationMembersQueryOptions } from '../api/queries';
import { MigrationMembersTab } from './migration-members-tab';

export default async function MigrationMemberListing() {
  const page = searchParamsCache.get('migration_page');
  const perPage = searchParamsCache.get('migration_perPage');
  const search = searchParamsCache.get('migration_search') ?? undefined;
  const status = searchParamsCache.get('migration_status') ?? undefined;
  const packageId = searchParamsCache.get('migration_package_id') ?? undefined;

  const filters = {
    page,
    limit: perPage,
    ...(search && { search }),
    ...(status && status !== 'all' && { status }),
    ...(packageId && packageId !== 'all' && { package_id: packageId })
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(migrationMembersQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MigrationMembersTab />
    </HydrationBoundary>
  );
}
