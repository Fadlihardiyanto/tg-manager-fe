'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Member } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { STATUS_OPTIONS } from './options';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Member>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'name',
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }: { column: Column<Member, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const initials = `${row.original.first_name?.[0] || ''}${row.original.last_name?.[0] || ''}`.toUpperCase();
      return (
        <div className="flex gap-3 items-center">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[12px]">
            {initials}
          </div>
          <div className="truncate line-clamp-2 max-w-56">
              <p className="text-sm font-bold text-foreground">{row.original.first_name} {row.original.last_name}</p>
              <p className="text-xs text-muted-foreground">@{row.original.username}</p>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search members...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'phone',
    header: 'PHONE',
    cell: ({ row }) => row.original.phone || '-'
  },
  {
    id: 'subscription',
    accessorFn: (row) => row.subscription?.package_name || '-',
    enableSorting: false,
    header: 'SUBSCRIPTION',
    cell: ({ row }) => {
      const packageName = row.original.subscription?.package_name;
      if (!packageName) return '-';
      return <Badge variant="secondary" className="font-medium whitespace-nowrap">{packageName}</Badge>;
    }
  },
  {
    id: 'joined',
    accessorKey: 'created_at',
    header: 'JOINED',
    cell: ({ cell }) => {
      const date = cell.getValue<string | undefined>();
      return date ? format(new Date(date), 'dd MMMM yyyy', { locale: idLocale }) : '-';
    }
  },
  {
    id: 'expired',
    accessorFn: (row) => row.subscription?.expired_at,
    header: 'EXPIRED',
    cell: ({ row }) => {
      const date = row.original.subscription?.expired_at;
      return date ? format(new Date(date), 'dd MMMM yyyy', { locale: idLocale }) : '-';
    }
  },
  {
    id: 'status',
    accessorFn: (row) => row.subscription?.status || 'expired',
    enableSorting: false,
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.original.subscription?.status || 'expired';

      const variant: 'default' | 'secondary' | 'destructive' | 'outline' =
        status === 'active' ? 'default' :
        status === 'grace_period' ? 'secondary' : 'outline';

      const softClass =
        status === 'active' ? 'bg-primary/10 text-primary border-transparent' :
        status === 'grace_period' ? 'bg-secondary/60 text-secondary-foreground border-transparent' :
        'text-destructive border-destructive/30';

      return (
        <Badge variant={variant} className={cn('capitalize', softClass)}>
          {status.replace('_', ' ')}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'status',
      variant: 'multiSelect' as const,
      options: STATUS_OPTIONS
    }
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
