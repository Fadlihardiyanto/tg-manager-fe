// ============================================================
// Group Mutations — React Query Mutation Options
// ============================================================

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { updateGroup, deleteGroup, bulkDeleteGroups, syncGroups, disconnectGroup } from './service';
import { groupKeys } from './queries';
import type { UpdateGroupRequest } from './types';

export const updateGroupMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateGroupRequest }) =>
    updateGroup(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: groupKeys.all });
  }
});

export const deleteGroupMutation = mutationOptions({
  mutationFn: (id: string) => deleteGroup(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: groupKeys.all });
  }
});

export const bulkDeleteGroupsMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkDeleteGroups(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: groupKeys.all });
  }
});

export const syncGroupsMutation = mutationOptions({
  mutationFn: () => syncGroups(),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: groupKeys.all });
  }
});

export const disconnectGroupMutation = mutationOptions({
  mutationFn: (id: string) => disconnectGroup(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: groupKeys.all });
  }
});
