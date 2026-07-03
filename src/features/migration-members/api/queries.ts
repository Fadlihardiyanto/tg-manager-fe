import { queryOptions } from '@tanstack/react-query';
import { getMigrationMembers } from './service';
import type { MigrationMemberFilters } from './types';

export const migrationMembersKeys = {
  all: ['migration-members'] as const,
  list: (filters: MigrationMemberFilters) => [...migrationMembersKeys.all, 'list', filters] as const
};

export const migrationMembersQueryOptions = (filters: MigrationMemberFilters) =>
  queryOptions({
    queryKey: migrationMembersKeys.list(filters),
    queryFn: () => getMigrationMembers(filters),
    placeholderData: (prev) => prev
  });
