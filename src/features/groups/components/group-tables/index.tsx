'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { groupsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { TelegramGroup } from '../../api/types';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

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
    pageCount: 1,
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

  return (
    <DataTable
      table={table}
      title='Daftar Grup'
      description='Kelola grup Telegram, penugasan bot, dan status akses member.'
      emptyState={emptyState}
      actionBar={
        selectedCount > 0 && onBulkDelete ? (
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium'>{selectedCount} grup dipilih</span>
            <div className='ml-auto flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.toggleAllRowsSelected(false)}
              >
                Batal Pilih
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => {
                  const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
                  onBulkDelete(ids);
                }}
              >
                <Icons.trash className='mr-2 h-4 w-4' />
                Hapus {selectedCount} Grup
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <DataTableToolbar table={table}>{toolbarActions}</DataTableToolbar>
    </DataTable>
  );
}
