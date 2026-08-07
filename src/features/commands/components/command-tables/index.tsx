'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
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
}

export function CommandTable({ onEdit, onBulkDelete, toolbarActions, notice }: CommandTableProps) {
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
      <div className='flex items-center gap-3'>
        <span className='text-sm font-medium text-primary'>{selectedCount} perintah dipilih</span>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={() => table.toggleAllRowsSelected(false)}
          >
            Batal Pilih
          </Button>
          <Button
            variant='destructive'
            size='sm'
            className='rounded-full'
            onClick={() => {
              const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
              onBulkDelete(ids);
            }}
          >
            <Icons.trash className='mr-2 h-4 w-4' />
            Hapus {selectedCount} Perintah
          </Button>
        </div>
      </div>
    ) : undefined;

  return (
    <div className='flex min-h-0 flex-1'>
      <DataTable
        table={table}
        notice={notice}
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
