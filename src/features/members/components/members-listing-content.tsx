'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { MembersTable } from './members-table';

export function MembersListingContent() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    search: parseAsString,
    status: parseAsString,
    package_id: parseAsString
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.search && { search: params.search }),
    ...(params.status && params.status !== 'all' && { status: params.status }),
    ...(params.package_id && { package_id: params.package_id })
  };

  return <MembersTable filters={filters} />;
}
