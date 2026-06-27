// ============================================================
// Bot Queries — React Query Options + Key Factory
// ============================================================

import { queryOptions } from '@tanstack/react-query';
import { getBots, getBotById } from './service';

export const botKeys = {
  all: ['bots'] as const,
  list: () => [...botKeys.all, 'list'] as const,
  detail: (id: string) => [...botKeys.all, 'detail', id] as const
};

export const botsQueryOptions = () =>
  queryOptions({
    queryKey: botKeys.list(),
    queryFn: () => getBots()
  });

export const botByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: botKeys.detail(id),
    queryFn: () => getBotById(id)
  });
