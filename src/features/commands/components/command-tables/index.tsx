'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { RowSelectionBar } from '@/components/ui/table/row-selection-bar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { commandsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { Command } from '../../api/types';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface CommandTableProps {
  onEdit: (cmd: Command) => void;
  onBulkDelete?: (ids: string[]) => void;
  toolbarActions?: ReactNode;
  notice?: ReactNode;
  emptyState?: ReactNode;
}

export function CommandTable({
  onEdit,
  onBulkDelete,
  toolbarActions,
  notice,
  emptyState
}: CommandTableProps) {
  const { data } = useSuspenseQuery(commandsQueryOptions());

  const commands = data.data ?? [];
  const botUsernameOptions = Array.from(
    new Set(
      commands
        .map((command) => command.bot_username)
        .filter((username): username is string => Boolean(username))
    )
  ).map((username) => ({
    label: username.startsWith('@') ? username : `@${username}`,
    value: username
  }));
  const columns = useMemo(
    () => getColumns(botUsernameOptions, onEdit),
    [botUsernameOptions, onEdit]
  );

  const { table } = useDataTable({
    data: commands,
    columns,
    pageCount: -1,
    shallow: true,
    debounceMs: 500,
    manualFiltering: false,
    initialState: {
      columnPinning: { right: ['actions'] },
      sorting: [{ id: 'created_at', desc: true }]
    },
    enableRowSelection: true
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const selectionBar =
    selectedCount > 0 && onBulkDelete ? (
      <RowSelectionBar
        selectedCount={selectedCount}
        noun='perintah'
        onClearSelection={() => table.toggleAllRowsSelected(false)}
        onDelete={() =>
          onBulkDelete(table.getFilteredSelectedRowModel().rows.map((r) => r.original.id))
        }
      />
    ) : undefined;

  return (
    <div className='flex min-h-0 flex-1'>
      <DataTable
        table={table}
        notice={notice}
        emptyState={emptyState}
        title='Daftar Perintah'
        description='Kelola perintah kustom, akses, tipe balasan, dan status aktifnya.'
      >
        <DataTableToolbar table={table} hideViewOptions={selectedCount > 0}>
          {selectionBar ?? toolbarActions}
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}
