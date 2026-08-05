'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { packageKeys } from '../../api/queries';
import type { Package, PackagesListResponse } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate, formatRupiah } from '@/lib/format';

export function StatusCell({ pkg }: { pkg: Package }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  const activateMutation = useMutation({
    ...togglePackageStatusMutation(true),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData<PackagesListResponse | undefined>(packageKeys.list(), (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) => (p.id === res.data!.id ? res.data! : p))
          };
        });
      }
      toast.success('Paket diaktifkan');
    },
    onError: () => toast.error('Gagal mengaktifkan paket')
  });

  const deactivateMutation = useMutation({
    ...togglePackageStatusMutation(false),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.setQueryData<PackagesListResponse | undefined>(packageKeys.list(), (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) => (p.id === res.data!.id ? res.data! : p))
          };
        });
      }
      toast.success('Paket dinonaktifkan');
    },
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
        aria-label={pkg.is_active ? 'Nonaktifkan paket' : 'Aktifkan paket'}
      />
    </>
  );
}

export function getColumns(onEdit?: (pkg: Package) => void): ColumnDef<Package>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nama' />,
      cell: ({ row }) => (
        <div className={cn('flex items-center gap-3', !row.original.is_active && 'opacity-60')}>
          <div className='flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-amber-500/5 ring-1 ring-amber-500/20'>
            <Icons.product className='size-4 text-amber-600 dark:text-amber-400' />
          </div>
          <span className='font-semibold'>{row.getValue('name')}</span>
        </div>
      ),
      meta: {
        label: 'Nama',
        placeholder: 'Cari paket...',
        variant: 'text',
        icon: Icons.text
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'price',
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Harga' />,
      cell: ({ cell }) => {
        const price = cell.getValue<number>();
        return (
          <span className='font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
            {formatRupiah(price)}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
      meta: { label: 'Harga' }
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Deskripsi' />,
      cell: ({ row }) => {
        const description = row.original.description?.trim();
        return (
          <div className='max-w-[280px] text-sm text-muted-foreground line-clamp-2'>
            {description || '-'}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      meta: { label: 'Deskripsi' }
    },
    {
      id: 'duration_days',
      accessorKey: 'duration_days',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durasi' />,
      cell: ({ cell }) => {
        const days = cell.getValue<number>();
        return <span className='text-sm'>{days} hari</span>;
      },
      enableSorting: true,
      enableColumnFilter: false,
      meta: { label: 'Durasi' }
    },
    {
      id: 'groups',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Grup' />,
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
      enableColumnFilter: false,
      meta: { label: 'Grup' }
    },
    {
      id: 'is_all_access',
      accessorFn: (row) => (row.is_all_access ? 'true' : 'false'),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Akses Penuh' />,
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
              'gap-1.5 font-medium',
              isAllAccess
                ? 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400'
                : 'text-muted-foreground'
            )}
          >
            {isAllAccess && <Icons.check className='size-3' />}
            {isAllAccess ? 'Ya' : 'Tidak'}
          </Badge>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Akses Penuh',
        variant: 'multiSelect' as const,
        options: [
          { label: 'Ya', value: 'true' },
          { label: 'Tidak', value: 'false' }
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
        label: 'Status',
        variant: 'multiSelect' as const,
        options: [
          { label: 'Aktif', value: 'true' },
          { label: 'Nonaktif', value: 'false' }
        ]
      }
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Dibuat' />,
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
      enableColumnFilter: false,
      meta: { label: 'Dibuat' }
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
