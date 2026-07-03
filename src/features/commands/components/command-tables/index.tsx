'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { commandsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { Command } from '../../api/types';
import { useMemo } from 'react';

interface CommandTableProps {
  onEdit: (cmd: Command) => void;
}

export function CommandTable({ onEdit }: CommandTableProps) {
  const { data } = useSuspenseQuery(commandsQueryOptions());

  const commands = data.data ?? [];
  const botUsernameOptions = Array.from(
    new Set(commands.map((command) => command.bot_username).filter(Boolean))
  ).map((username) => ({
    label: `@${username}`,
    value: username
  }));
  const columns = useMemo(
    () => getColumns(botUsernameOptions, onEdit),
    [botUsernameOptions, onEdit]
  );

  const { table } = useDataTable({
    data: commands,
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
