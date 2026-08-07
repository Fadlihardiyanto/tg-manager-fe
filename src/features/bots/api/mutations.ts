// ============================================================
// Bot Mutations — React Query Mutation Options
// ============================================================

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createBot, updateBot, deleteBot, bulkDeleteBots } from './service';
import { botKeys } from './queries';
import type { CreateBotRequest, UpdateBotRequest } from './types';

export const createBotMutation = mutationOptions({
  mutationFn: (data: CreateBotRequest) => createBot(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: botKeys.all });
  }
});

export const updateBotMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateBotRequest }) => updateBot(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: botKeys.all });
  }
});

export const deleteBotMutation = mutationOptions({
  mutationFn: (id: string) => deleteBot(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: botKeys.all });
  }
});

export const bulkDeleteBotsMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkDeleteBots(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: botKeys.all });
  }
});
