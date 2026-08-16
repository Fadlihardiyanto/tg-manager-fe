'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { RowSelectionBar } from '@/components/ui/table/row-selection-bar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { discountsQueryOptions } from '../../api/queries';
import { getColumns } from './columns';
import type { MemberDiscount } from '../../api/types';
import { useMemo } from 'react';
import type { ReactNode } from 'react';

interface DiscountTableProps {
  onEdit: (discount: MemberDiscount) => void;
  onBulkDelete?: (ids: string[]) => void;
  toolbarActions?: ReactNode;
}

export function DiscountTable({ onEdit, onBulkDelete, toolbarActions }: DiscountTableProps) {
  const columns = useMemo(() => getColumns(onEdit), [onEdit]);

  const { data } = useSuspenseQuery(discountsQueryOptions());

  const discounts = data.data ?? [];

  const { table } = useDataTable({
    data: discounts,
    columns,
    pageCount: -1,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    },
    enableRowSelection: true
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const selectionBar =
    selectedCount > 0 && onBulkDelete ? (
      <RowSelectionBar
        selectedCount={selectedCount}
        noun='diskon'
        onClearSelection={() => table.toggleAllRowsSelected(false)}
        onDelete={() =>
          onBulkDelete(table.getFilteredSelectedRowModel().rows.map((r) => r.original.id))
        }
      />
    ) : undefined;

  return (
    <DataTable
      table={table}
      title='Daftar Diskon'
      description='Kelola kode promo, nilai diskon, batas penggunaan, dan masa berlaku.'
    >
      <DataTableToolbar table={table} hideViewOptions={selectedCount > 0}>
        {selectionBar ?? toolbarActions}
      </DataTableToolbar>
    </DataTable>
  );
}
