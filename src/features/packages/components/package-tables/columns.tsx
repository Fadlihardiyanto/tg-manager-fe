'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { togglePackageStatusMutation } from '../../api/mutations';
import type { Package } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';

// ponytail: inline status cell — one place, one purpose
function StatusCell({ pkg }: { pkg: Package }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activateMutation = useMutation({
    ...togglePackageStatusMutation(true),
    onSuccess: () => toast.success('Paket diaktifkan'),
    onError: () => toast.error('Gagal mengaktifkan paket')
  });

  const deactivateMutation = useMutation({
    ...togglePackageStatusMutation(false),
    onSuccess: () => toast.success('Paket dinonaktifkan'),
    onError: () => toast.error('Gagal menonaktifkan paket')
  });

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      setConfirmOpen(true);
      return;
    }
    activateMutation.mutate(pkg.id);
  };

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan paket?</AlertDialogTitle>
            <AlertDialogDescription>
              Member baru tidak akan bisa melihat atau membeli paket ini. Langganan member yang
              sedang berjalan tetap berlaku sampai kadaluarsa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateMutation.mutate(pkg.id)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Switch
        checked={pkg.is_active}
        onCheckedChange={handleToggle}
        disabled={activateMutation.isPending || deactivateMutation.isPending}
        aria-label={pkg.is_active ? 'Deactivate package' : 'Activate package'}
      />
    </>
  );
}

export function getColumns(onEdit?: (pkg: Package) => void): ColumnDef<Package>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => (
        <div className={cn('flex items-center gap-2', !row.original.is_active && 'opacity-60')}>
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
      header: ({ column }) => <DataTableColumnHeader column={column} title='Price' />,
      cell: ({ cell }) => {
        const price = cell.getValue<number>();
        return <span className='font-semibold tabular-nums'>{formatRupiah(price)}</span>;
      },
      enableSorting: true,
      enableColumnFilter: false
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      cell: ({ row }) => {
        const description = row.original.description?.trim();
        return (
          <div className='max-w-[280px] text-sm text-muted-foreground line-clamp-2'>
            {description || '-'}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'duration_days',
      accessorKey: 'duration_days',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Duration' />,
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
      id: 'groups',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Groups' />,
      cell: ({ row }) => {
        const groups = row.original.groups ?? [];

        if (groups.length === 0) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        return (
          <div className='flex max-w-[320px] flex-wrap gap-1'>
            {groups.map((group) => (
              <Badge key={group.id} variant='secondary' className='max-w-full truncate'>
                {group.name}
              </Badge>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
    },
    {
      id: 'is_all_access',
      accessorFn: (row) => (row.is_all_access ? 'true' : 'false'),
      header: ({ column }) => <DataTableColumnHeader column={column} title='All Access' />,
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) return true;
        const value = row.getValue<string>(columnId);
        return filterValue.includes(value);
      },
      cell: ({ row }) => {
        const isAllAccess = row.original.is_all_access;
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
      enableColumnFilter: true,
      meta: {
        label: 'all access',
        variant: 'multiSelect' as const,
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' }
        ]
      }
    },
    {
      id: 'is_active',
      accessorFn: (row) => (row.is_active ? 'true' : 'false'),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) return true;
        const value = row.getValue<string>(columnId);
        return filterValue.includes(value);
      },
      cell: ({ row }) => <StatusCell pkg={row.original} />,
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'status',
        variant: 'multiSelect' as const,
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' }
        ]
      }
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Created' />,
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
