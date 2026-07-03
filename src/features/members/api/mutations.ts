import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { extendAccess, kickMember, manualSync, resendLink, bulkKickMembers } from './service';
import { membersKeys } from './queries';
import type { ExtendAccessPayload } from './types';

export const extendAccessMutation = mutationOptions({
  mutationFn: ({ id, payload }: { id: string; payload: ExtendAccessPayload }) =>
    extendAccess(id, payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});

export const kickMemberMutation = mutationOptions({
  mutationFn: (id: string) => kickMember(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});

export const manualSyncMutation = mutationOptions({
  mutationFn: (id: string) => manualSync(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});

export const resendLinkMutation = mutationOptions({
  mutationFn: (id: string) => resendLink(id)
});

export const bulkKickMembersMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkKickMembers(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});
