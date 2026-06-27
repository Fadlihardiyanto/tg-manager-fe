'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { discountsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { MemberDiscount } from '../../api/types';
import { useMemo } from 'react';

interface DiscountTableProps {
  onEdit: (discount: MemberDiscount) => void;
}

export function DiscountTable({ onEdit }: DiscountTableProps) {
  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { data } = useSuspenseQuery(discountsQueryOptions());

  const discounts = data.data ?? [];

  const { table } = useDataTable({
    data: discounts,
    columns,
    pageCount: 1,
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
