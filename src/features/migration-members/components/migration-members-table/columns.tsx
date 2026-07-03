'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Option } from '@/types/data-table';
import type { MigrationMember } from '../../api/types';

export function getColumns({
  packageNames,
  packageOptions
}: {
  packageNames: Map<string, string>;
  packageOptions: Option[];
}): ColumnDef<MigrationMember>[] {
  return [
    {
      id: 'migration_search',
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Username' />,
      cell: ({ row }) => <span className='font-medium'>@{row.original.username}</span>,
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        label: 'Username',
        placeholder: 'Search username...',
        variant: 'text',
        icon: Icons.text
      }
    },
    {
      id: 'migration_package_id',
      accessorKey: 'package_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Package' />,
      cell: ({ row }) => packageNames.get(row.original.package_id) ?? '-',
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        label: 'Package',
        variant: 'select',
        options: packageOptions
      }
    },
    {
      accessorKey: 'expired_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Expired At' />,
      cell: ({ row }) =>
        row.original.expired_at
          ? formatDate(row.original.expired_at, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : '-'
    },
    {
      id: 'migration_status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === 'claimed' ? 'default' : 'outline'}
          className='capitalize'
        >
          {row.original.status}
        </Badge>
      ),
      enableColumnFilter: true,
      enableSorting: false,
      meta: {
        label: 'Status',
        variant: 'select',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Claimed', value: 'claimed' }
        ]
      }
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Created At' />,
      cell: ({ row }) =>
        row.original.created_at
          ? formatDate(row.original.created_at, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : '-'
    }
  ];
}
