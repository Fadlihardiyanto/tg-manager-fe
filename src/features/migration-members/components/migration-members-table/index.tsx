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

  const { data, isLoading, isError } = useQuery({
    ...migrationMembersQueryOptions(filters),
    placeholderData: (previous) => previous
  });
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
  const isFirstLoad = isLoading && !data;

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
      {isError ? (
        <Alert variant='destructive'>
          <Icons.close />
          <AlertTitle>Gagal memuat data migrasi</AlertTitle>
          <AlertDescription>Jaringan bermasalah atau server tidak tersedia.</AlertDescription>
        </Alert>
      ) : data?.success === false ? (
        <Alert variant='destructive'>
          <Icons.close />
          <AlertTitle>Failed to load migration members</AlertTitle>
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        table={table}
        title='Migration & Import'
        description='Kelola migrasi member dari sistem lama ke sistem baru. Anda dapat menambahkan member secara manual atau mengimpor dari file CSV.'
        notice={
          isFirstLoad ? (
            <div className='flex items-center justify-center py-6'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                    opacity='0.25'
                  />
                  <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='4' fill='none' />
                </svg>
                Memuat...
              </div>
            </div>
          ) : undefined
        }
      >
        <DataTableToolbar table={table}>
          <ImportMigrationMembersDialog onImported={onImported} />
          <Button
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={onExport}
            isLoading={isExporting}
          >
            Export CSV
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
