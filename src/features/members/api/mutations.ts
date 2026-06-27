import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  extendAccess,
  kickMember,
  manualSync,
  resendLink,
  bulkKickMembers,
  bulkExtendAccess
} from './service';
import { membersKeys } from './queries';

export const extendAccessMutation = mutationOptions({
  mutationFn: ({ id, newExpiryAt }: { id: string; newExpiryAt: string }) =>
    extendAccess(id, newExpiryAt),
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

export const bulkExtendAccessMutation = mutationOptions({
  mutationFn: ({ ids, newExpiryAt }: { ids: string[]; newExpiryAt: string }) =>
    bulkExtendAccess(ids, newExpiryAt),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});
