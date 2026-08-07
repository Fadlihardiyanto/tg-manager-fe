import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCommand, updateCommand, deleteCommand, bulkDeleteCommands } from './service';
import { commandKeys } from './queries';
import type { CreateCommandRequest, UpdateCommandRequest } from './types';

export const createCommandMutation = mutationOptions({
  mutationFn: (data: CreateCommandRequest) => createCommand(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: commandKeys.all });
  }
});

export const updateCommandMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateCommandRequest }) =>
    updateCommand(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: commandKeys.all });
  }
});

export const deleteCommandMutation = mutationOptions({
  mutationFn: (id: string) => deleteCommand(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: commandKeys.all });
  }
});

export const bulkDeleteCommandsMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkDeleteCommands(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: commandKeys.all });
  }
});
