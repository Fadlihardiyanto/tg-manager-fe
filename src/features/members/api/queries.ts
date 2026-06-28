import { queryOptions } from '@tanstack/react-query';
import { getMembers, getMember } from './service';
import type { MemberFilters } from './types';

export const membersKeys = {
  all: ['members'] as const,
  list: (filters: MemberFilters) => [...membersKeys.all, 'list', filters] as const,
  detail: (id: string) => [...membersKeys.all, 'detail', id] as const
};

export const membersQueryOptions = (filters: MemberFilters) =>
  queryOptions({
    queryKey: membersKeys.list(filters),
    queryFn: () => getMembers(filters),
    placeholderData: (prev) => prev
  });

export const memberDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: membersKeys.detail(id),
    queryFn: () => getMember(id)
  });
