'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryState } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { broadcastsQueryOptions } from '../../api/queries';
import { columns } from './columns';

interface BroadcastTableProps {
  botId: string;
}

export function BroadcastTable({ botId }: BroadcastTableProps) {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const filters = { page, limit: perPage };

  const { data } = useSuspenseQuery(broadcastsQueryOptions(botId, filters));
  const items = data?.data ?? [];
  const pageCount = data?.meta?.total_pages ?? 1;

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
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
