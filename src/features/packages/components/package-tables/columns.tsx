'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Package } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';

export function getColumns(
  onEdit?: (pkg: Package) => void
): ColumnDef<Package>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Icons.product className='size-4 text-muted-foreground' />
          <span className='font-medium'>{row.getValue('name')}</span>
        </div>
      ),
      meta: {
        label: 'Name',
        placeholder: 'Search packages...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ cell }) => {
        const price = cell.getValue<number>();
        return (
          <span className='font-semibold tabular-nums'>
            {formatRupiah(price)}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'duration_days',
      accessorKey: 'duration_days',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Duration' />
      ),
      cell: ({ cell }) => {
        const days = cell.getValue<number>();
        return (
          <span className='text-sm'>
            {days} day{days !== 1 ? 's' : ''}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'is_all_access',
      accessorKey: 'is_all_access',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='All Access' />
      ),
      cell: ({ cell }) => {
        const isAllAccess = cell.getValue<boolean>();
        return (
          <Badge
            variant={isAllAccess ? 'default' : 'outline'}
            className={cn(
              isAllAccess
                ? 'bg-primary/10 text-primary border-transparent'
                : 'text-muted-foreground'
            )}
          >
            {isAllAccess ? 'Yes' : 'No'}
          </Badge>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ cell }) => {
        const isActive = cell.getValue<boolean>();
        const Icon = isActive ? Icons.circleCheck : Icons.xCircle;
        return (
          <Badge
            variant={isActive ? 'default' : 'outline'}
            className={cn(
              isActive
                ? 'bg-primary/10 text-primary border-transparent'
                : 'text-muted-foreground'
            )}
          >
            <Icon className='size-3' />
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return (
          <span className='text-muted-foreground text-sm'>
            {formatDate(date, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
