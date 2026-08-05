import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  extendAccess,
  kickMember,
  manualSync,
  resendLink,
  bulkKickMembers,
  bulkExtendMembers
} from './service';
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
  mutationFn: ({ id, subscriptionId }: { id: string; subscriptionId?: string }) =>
    kickMember(id, subscriptionId),
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
  mutationFn: ({ id, subscriptionId }: { id: string; subscriptionId?: string }) =>
    resendLink(id, subscriptionId),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});

export const bulkKickMembersMutation = mutationOptions({
  mutationFn: (targets: { id: string; subscriptionId?: string }[]) => bulkKickMembers(targets),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});

export const bulkExtendMembersMutation = mutationOptions({
  mutationFn: (targets: { id: string; subscriptionId: string; additionalDays: number }[]) =>
    bulkExtendMembers(
      targets.map((t) => ({
        id: t.id,
        subscriptionId: t.subscriptionId,
        additionalDays: t.additionalDays
      }))
    ),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: membersKeys.all });
  }
});
