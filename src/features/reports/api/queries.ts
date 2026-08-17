import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportSettings, getReportFailures, saveReportSettings } from './service';
import type { SaveReportSettingsRequest } from './types';

export const reportsKeys = {
  all: ['reports'] as const,
  settings: () => [...reportsKeys.all, 'settings'] as const,
  failures: (date?: string) => [...reportsKeys.all, 'failures', date ?? 'today'] as const
};

export const reportSettingsQueryOptions = () =>
  queryOptions({
    queryKey: reportsKeys.settings(),
    queryFn: getReportSettings
  });

export const reportFailuresQueryOptions = (date?: string) =>
  queryOptions({
    queryKey: reportsKeys.failures(date),
    queryFn: () => getReportFailures(date)
  });

export function useSaveReportSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveReportSettingsRequest) => saveReportSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.settings() });
    }
  });
}
