'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { membersQueryOptions } from '../../api/queries';
import { columns } from './columns';
import { BulkActionBar } from '../bulk-action-bar';

import type { MemberFilters } from '../../api/types';

export function MembersTable({ filters }: { filters: MemberFilters }) {
  const { data } = useSuspenseQuery(membersQueryOptions(filters));

  const pageCount = data.meta?.total_pages ?? 0;
  const tableData = data.data ?? [];

  const { table } = useDataTable({
    data: tableData,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    enableRowSelection: true,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => table.toggleAllRowsSelected(false)}
      />
    </>
  );
}
