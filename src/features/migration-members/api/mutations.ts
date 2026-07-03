import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { importMigrationMembers } from './service';
import { migrationMembersKeys } from './queries';
import type { MigrationImportPayload } from './types';

export const importMigrationMembersMutation = mutationOptions({
  mutationFn: (payload: MigrationImportPayload) => importMigrationMembers(payload),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: migrationMembersKeys.all });
  }
});
