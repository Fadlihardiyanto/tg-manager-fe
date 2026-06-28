'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { packagesQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { Package } from '../../api/types';
import { useMemo } from 'react';

interface PackageTableProps {
  onEdit: (pkg: Package) => void;
}

export function PackageTable({ onEdit }: PackageTableProps) {
  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { data } = useSuspenseQuery(packagesQueryOptions());

  const packages = data.data ?? [];

  const { table } = useDataTable({
    data: packages,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 500,
    manualFiltering: false,
    initialState: {
      columnPinning: { right: ['actions'] },
      sorting: [{ id: 'created_at', desc: true }]
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
