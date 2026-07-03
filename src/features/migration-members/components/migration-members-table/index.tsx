'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Icons } from '@/components/icons';
import { useDataTable } from '@/hooks/use-data-table';
import { packagesQueryOptions } from '@/features/packages/api/queries';
import { migrationMembersQueryOptions } from '../../api/queries';
import type { MigrationImportError } from '../../api/types';
import { ImportMigrationMembersDialog } from '../import-migration-members-dialog';
import { getColumns } from './columns';

interface MigrationMembersTableProps {
  onExport: () => Promise<void>;
  isExporting: boolean;
  onImported: (errors: MigrationImportError[]) => void;
}

export function MigrationMembersTable({
  onExport,
  isExporting,
  onImported
}: MigrationMembersTableProps) {
  const [params] = useQueryStates({
    migration_page: parseAsInteger.withDefault(1),
    migration_perPage: parseAsInteger.withDefault(10),
    migration_search: parseAsString,
    migration_status: parseAsString,
    migration_package_id: parseAsString
  });

  const filters = useMemo(
    () => ({
      page: params.migration_page,
      limit: params.migration_perPage,
      ...(params.migration_search ? { search: params.migration_search } : {}),
      ...(params.migration_status ? { status: params.migration_status } : {}),
      ...(params.migration_package_id ? { package_id: params.migration_package_id } : {})
    }),
    [params]
  );

  const { data } = useQuery(migrationMembersQueryOptions(filters));
  const { data: packagesData } = useQuery({
    ...packagesQueryOptions(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always'
  });

  const packages = useMemo(() => packagesData?.data ?? [], [packagesData?.data]);
  const packageNames = useMemo(
    () => new Map(packages.map((pkg) => [pkg.id, pkg.name])),
    [packages]
  );
  const packageOptions = useMemo(
    () => packages.map((pkg) => ({ label: pkg.name, value: pkg.id })),
    [packages]
  );

  const columns = useMemo(
    () =>
      getColumns({
        packageNames,
        packageOptions
      }),
    [packageNames, packageOptions]
  );

  const rows = data?.data ?? [];
  const pageCount = Math.max(data?.meta?.total_pages ?? 0, 1);

  const { table } = useDataTable({
    data: rows,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    manualFiltering: true,
    queryStateKeys: {
      page: 'migration_page',
      perPage: 'migration_perPage',
      sort: 'migration_sort'
    }
  });

  return (
    <>
      {data?.success === false ? (
        <Alert variant='destructive'>
          <Icons.close />
          <AlertTitle>Failed to load migration members</AlertTitle>
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <ImportMigrationMembersDialog onImported={onImported} />
          <Button variant='outline' onClick={onExport} isLoading={isExporting}>
            Export CSV
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
