'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { RowSelectionBar } from '@/components/ui/table/row-selection-bar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { groupsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { TelegramGroup } from '../../api/types';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

interface GroupTableProps {
  onEdit: (group: TelegramGroup) => void;
  onBulkDelete?: (ids: string[]) => void;
  toolbarActions?: ReactNode;
  emptyState?: ReactNode;
}

export function GroupTable({ onEdit, onBulkDelete, toolbarActions, emptyState }: GroupTableProps) {
  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { data } = useSuspenseQuery(groupsQueryOptions());

  const groups = data.data ?? [];

  const { table } = useDataTable({
    data: groups,
    columns,
    pageCount: -1,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        telegram_chat_id: false,
        created_at: false
      }
    },
    enableRowSelection: true
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const selectionBar =
    selectedCount > 0 && onBulkDelete ? (
      <RowSelectionBar
        selectedCount={selectedCount}
        noun='grup'
        onClearSelection={() => table.toggleAllRowsSelected(false)}
        onDelete={() =>
          onBulkDelete(table.getFilteredSelectedRowModel().rows.map((r) => r.original.id))
        }
      />
    ) : undefined;

  return (
    <DataTable
      table={table}
      title='Daftar Grup'
      description='Kelola grup Telegram, penugasan bot, dan status akses member.'
      emptyState={emptyState}
    >
      <DataTableToolbar table={table} hideViewOptions={selectedCount > 0}>
        {selectionBar ?? toolbarActions}
      </DataTableToolbar>
    </DataTable>
  );
}
