'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { botsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { TelegramBot } from '../../api/types';

interface BotTableProps {
  onEdit: (bot: TelegramBot) => void;
  toolbarActions?: ReactNode;
  notice?: ReactNode;
}

export function BotTable({ onEdit, toolbarActions, notice }: BotTableProps) {
  const { data } = useSuspenseQuery(botsQueryOptions());
  const bots = data.data ?? [];

  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { table } = useDataTable({
    data: bots,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <DataTable table={table} notice={notice}>
      <DataTableToolbar table={table}>{toolbarActions}</DataTableToolbar>
    </DataTable>
  );
}
