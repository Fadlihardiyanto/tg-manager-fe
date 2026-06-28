import { queryOptions } from '@tanstack/react-query';
import { getCommands } from './service';

export const commandKeys = {
  all: ['commands'] as const,
  list: () => [...commandKeys.all, 'list'] as const
};

export const commandsQueryOptions = () =>
  queryOptions({
    queryKey: commandKeys.list(),
    queryFn: () => getCommands()
  });
