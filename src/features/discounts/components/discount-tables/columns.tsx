'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { MemberDiscount } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';

function formatDiscountValue(discount: MemberDiscount) {
  if (discount.type === 'percentage') {
    return `${discount.value}%`;
  }
  return formatRupiah(discount.value);
}

export function getColumns(
  onEdit?: (discount: MemberDiscount) => void
): ColumnDef<MemberDiscount>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.original.name}</span>
          {row.original.code && (
            <span className='text-xs text-muted-foreground font-mono'>
              {row.original.code}
            </span>
          )}
        </div>
      ),
      meta: {
        label: 'Name',
        placeholder: 'Search discounts...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'type_value',
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type & Value' />
      ),
      cell: ({ row }) => {
        const discount = row.original;
        const typeBadge = discount.type === 'percentage'
          ? 'bg-primary/10 text-primary hover:bg-primary/20 border-transparent'
          : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border-transparent';
        return (
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className={cn(typeBadge)}>
              {discount.type === 'percentage' ? '%' : 'Fixed'}
            </Badge>
            <span className='font-semibold tabular-nums'>
              {formatDiscountValue(discount)}
            </span>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'usage',
      accessorKey: 'used_count',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Usage' />
      ),
      cell: ({ row }) => {
        const { used_count, max_usage } = row.original;
        const maxLabel = max_usage === -1 ? '∞' : max_usage.toString();
        return (
          <span className='text-sm tabular-nums'>
            {used_count} / {maxLabel}
          </span>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'valid_until',
      accessorKey: 'valid_until',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valid Until' />
      ),
      cell: ({ cell }) => {
        const date = cell.getValue<string>();
        if (!date) return <span className='text-muted-foreground text-sm'>—</span>;
        const isExpired = new Date(date) < new Date();
        return (
          <div className='flex items-center gap-2'>
            <span className={cn('text-sm', isExpired ? 'text-destructive' : 'text-muted-foreground')}>
              {formatDate(date, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {isExpired && (
              <Badge variant='outline' className='text-destructive border-destructive/30 text-xs'>
                Expired
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: true,
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
