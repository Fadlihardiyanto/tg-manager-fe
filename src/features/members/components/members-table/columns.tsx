'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Member, Subscription } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { STATUS_OPTIONS } from './options';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';

function getSubscriptionBadgeClass(status: Subscription['status']) {
  if (status === 'active') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'cancelled') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-muted text-muted-foreground border-border';
}

function getSubscriptionStatusLabel(status: Subscription['status']) {
  if (status === 'active') return 'Aktif';
  if (status === 'cancelled') return 'Dikeluarkan';
  return 'Kedaluwarsa';
}

function getSubscriptionDateLabel(subscription: Subscription) {
  if (subscription.status === 'cancelled') {
    return 'Dikeluarkan pada';
  }

  return 'Habis pada';
}

function getSubscriptionDisplayDate(subscription: Subscription) {
  const date =
    subscription.status === 'cancelled'
      ? (subscription.kicked_at ?? subscription.expired_at)
      : subscription.expired_at;

  return date ? format(new Date(date), 'dd MMM yyyy', { locale: idLocale }) : '-';
}

export const columns: ColumnDef<Member>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40
  },
  {
    id: 'name',
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }: { column: Column<Member, unknown> }) => (
      <DataTableColumnHeader column={column} title='Nama' />
    ),
    cell: ({ row }) => {
      const initials =
        `${row.original.first_name?.[0] || ''}${row.original.last_name?.[0] || ''}`.toUpperCase();
      return (
        <div className='flex gap-3 items-center'>
          <div className='flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[12px]'>
            {initials}
          </div>
          <div className='max-w-56 truncate'>
            <p className='text-sm font-bold text-foreground'>
              {row.original.first_name} {row.original.last_name}
            </p>
            <p className='text-xs text-muted-foreground'>
              {row.original.username
                ? `@${row.original.username}`
                : `ID: ${row.original.telegram_user_id}`}
            </p>
          </div>
        </div>
      );
    },
    meta: {
      label: 'Nama',
      placeholder: 'Cari member...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'phone',
    header: 'Telepon',
    cell: ({ row }) => row.original.phone || '-'
  },
  {
    id: 'subscription',
    accessorFn: (row) =>
      row.subscriptions?.map((subscription) => subscription.package_name).join(', ') ??
      row.active_packages.join(', '),
    enableSorting: false,
    header: 'Langganan',
    cell: ({ row }) => {
      const subscriptions = row.original.subscriptions;

      if (subscriptions?.length) {
        return (
          <div className='flex min-w-[220px] max-w-[300px] flex-col'>
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className='border-border/60 py-1.5 not-last:border-b'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <span
                        className={cn(
                          'mt-0.5 size-1.5 shrink-0 rounded-full',
                          subscription.status === 'active'
                            ? 'bg-emerald-500'
                            : subscription.status === 'cancelled'
                              ? 'bg-amber-500'
                              : 'bg-muted-foreground'
                        )}
                      />
                      <p className='truncate text-[13px] font-medium text-foreground'>
                        {subscription.package_name}
                      </p>
                    </div>
                    <p className='mt-0.5 pl-3 text-[11px] leading-4 text-muted-foreground'>
                      {getSubscriptionDateLabel(subscription)}:{' '}
                      {getSubscriptionDisplayDate(subscription)}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className={cn(
                      'mt-0.5 shrink-0 rounded-full border px-1.5 py-0 text-[9px] font-semibold',
                      getSubscriptionBadgeClass(subscription.status)
                    )}
                  >
                    {getSubscriptionStatusLabel(subscription.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        );
      }

      const packages = row.original.active_packages;
      if (!packages?.length) return '-';

      return (
        <div className='flex max-w-[320px] flex-wrap gap-1'>
          {packages.map((pkg) => (
            <Badge key={pkg} variant='secondary' className='font-medium whitespace-nowrap'>
              {pkg}
            </Badge>
          ))}
        </div>
      );
    }
  },
  {
    id: 'joined',
    accessorKey: 'created_at',
    header: 'Bergabung',
    cell: ({ cell }) => {
      const date = cell.getValue<string | undefined>();
      return date ? format(new Date(date), 'dd MMMM yyyy', { locale: idLocale }) : '-';
    },
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId) as string | undefined;
      if (!cellValue) return false;
      const cellTimestamp = new Date(cellValue).getTime();
      const [from, to] = filterValue as [number, number];
      return (!from || cellTimestamp >= from) && (!to || cellTimestamp <= to);
    },
    enableColumnFilter: true,
    meta: {
      label: 'Bergabung',
      variant: 'dateRange' as const
    }
  },
  {
    id: 'status',
    accessorFn: (row) => (row.global_status ? 'active' : 'expired'),
    enableSorting: false,
    header: 'Status',
    cell: () => null,
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
