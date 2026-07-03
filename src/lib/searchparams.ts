import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  tab: parseAsString,
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  gender: parseAsString,
  category: parseAsString,
  role: parseAsString,
  sort: parseAsString,
  search: parseAsString,
  status: parseAsString,
  package_id: parseAsString,
  migration_page: parseAsInteger.withDefault(1),
  migration_perPage: parseAsInteger.withDefault(10),
  migration_search: parseAsString,
  migration_status: parseAsString,
  migration_package_id: parseAsString,
  migration_sort: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
