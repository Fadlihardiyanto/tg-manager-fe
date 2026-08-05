import { queryOptions } from '@tanstack/react-query';
import { getBroadcasts, getBroadcastReach } from './service';

export const broadcastKeys = {
  all: ['broadcasts'] as const,
  list: (botId: string, filters: { page?: number; limit?: number }) =>
    [...broadcastKeys.all, 'list', botId, filters] as const,
  reach: (botId: string) => [...broadcastKeys.all, 'reach', botId] as const
};

export const broadcastsQueryOptions = (botId: string, filters: { page?: number; limit?: number }) =>
  queryOptions({
    queryKey: broadcastKeys.list(botId, filters),
    queryFn: () => getBroadcasts(botId, filters),
    refetchInterval: 15000
  });

export const broadcastReachQueryOptions = (botId: string) =>
  queryOptions({
    queryKey: broadcastKeys.reach(botId),
    queryFn: () => getBroadcastReach(botId),
    staleTime: 30_000
  });
