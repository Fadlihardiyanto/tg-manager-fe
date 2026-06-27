'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { groupsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { TelegramGroup } from '../../api/types';
import { useMemo } from 'react';

interface GroupTableProps {
  onEdit: (group: TelegramGroup) => void;
}

export function GroupTable({ onEdit }: GroupTableProps) {
  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { data } = useSuspenseQuery(groupsQueryOptions());

  const groups = data.data ?? [];

  const { table } = useDataTable({
    data: groups,
    columns,
    pageCount: 1, // no server-side pagination for groups (simple list)
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
