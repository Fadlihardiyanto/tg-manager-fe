'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryState } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDataTable } from '@/hooks/use-data-table';
import { membersQueryOptions } from '../../api/queries';
import { packagesQueryOptions } from '@/features/packages/api/queries';
import { columns } from './columns';
import { BulkActionBar } from '../bulk-action-bar';

import type { MemberFilters } from '../../api/types';

export function MembersTable({ filters }: { filters: MemberFilters }) {
  const [packageId, setPackageId] = useQueryState(
    'package_id',
    parseAsString.withOptions({ shallow: true, history: 'replace' })
  );

  const { data } = useQuery(membersQueryOptions(filters));
  const { data: packagesData } = useQuery(packagesQueryOptions());
  const packages = packagesData?.data ?? [];

  const pageCount = data?.meta?.total_pages ?? 0;
  const tableData = data?.data ?? [];

  const { table } = useDataTable({
    data: tableData,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    enableRowSelection: true,
    initialState: {
      columnPinning: { right: ['actions'] },
      columnVisibility: { status: false }
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.id);
  const selectedMembers = selectedRows.map((row) => row.original);

  return (
    <>
      <DataTable
        table={table}
        title='Member Aktif'
        description='Kelola member aktif, pantau paket langganan, dan lihat status keanggotaan.'
      >
        <DataTableToolbar table={table}>
          <Select
            value={packageId ?? 'all'}
            onValueChange={(v) => setPackageId(v === 'all' ? null : v)}
          >
            <SelectTrigger className='h-10 w-44 rounded-full border-border font-semibold'>
              <SelectValue placeholder='Semua paket' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua paket</SelectItem>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DataTableToolbar>
      </DataTable>
      <BulkActionBar
        selectedIds={selectedIds}
        selectedMembers={selectedMembers}
        onClearSelection={() => table.toggleAllRowsSelected(false)}
      />
    </>
  );
}
