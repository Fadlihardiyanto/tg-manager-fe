'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { updateCommandMutation } from '../../api/mutations';
import { commandKeys } from '../../api/queries';
import type { Command } from '../../api/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

// ponytail: inline status cell — one place, one purpose
function StatusCell({ cmd }: { cmd: Command }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    ...updateCommandMutation,
    onSuccess: () => {
      toast.success(cmd.is_active ? 'Perintah dinonaktifkan' : 'Perintah diaktifkan');
      void queryClient.invalidateQueries({ queryKey: commandKeys.all });
    },
    onError: () => toast.error('Gagal memperbarui status perintah')
  });

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      setConfirmOpen(true);
      return;
    }
    updateMutation.mutate({ id: cmd.id, values: { is_active: true } });
  };

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan perintah?</AlertDialogTitle>
            <AlertDialogDescription>
              Bot tidak akan merespon perintah ini sampai diaktifkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                updateMutation.mutate({
                  id: cmd.id,
                  values: { is_active: false }
                })
              }
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Switch
        checked={cmd.is_active}
        onCheckedChange={handleToggle}
        disabled={updateMutation.isPending}
        aria-label={cmd.is_active ? 'Nonaktifkan perintah' : 'Aktifkan perintah'}
      />
    </>
  );
}

interface BotUsernameOption {
  label: string;
  value: string;
}

export function getColumns(
  botUsernameOptions: BotUsernameOption[],
  onEdit?: (cmd: Command) => void
): ColumnDef<Command>[] {
  return [
    {
      id: 'command_trigger',
      accessorKey: 'command_trigger',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Perintah' />,
      cell: ({ row }) => (
        <div className={cn('flex items-center gap-2', !row.original.is_active && 'opacity-60')}>
          <code className='rounded bg-muted px-1.5 py-0.5 text-sm font-semibold'>
            {row.getValue('command_trigger')}
          </code>
        </div>
      ),
      meta: {
        label: 'Perintah',
        placeholder: 'Cari perintah...',
        variant: 'text',
        icon: Icons.slash
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    {
      id: 'bot_username',
      accessorKey: 'bot_username',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Username Bot' />,
      filterFn: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) return true;
        const value = row.getValue<string>(columnId);
        return filterValue.includes(value);
      },
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {row.original.bot_username ? `@${row.original.bot_username}` : '-'}
        </span>
      ),
      meta: {
        label: 'Username Bot',
        variant: 'multiSelect',
        options: botUsernameOptions
      },
      enableSorting: true,
      enableColumnFilter: true
    },
    {
      id: 'response_type',
      accessorKey: 'response_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tipe' />,
      cell: ({ cell }) => {
        const type = cell.getValue<string>();
        const badge =
          type === 'text'
            ? {
                className:
                  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100',
                label: 'Teks'
              }
            : type === 'photo'
              ? {
                  className:
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100',
                  label: 'Foto'
                }
              : {
                  className:
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-100',
                  label: 'Dokumen'
                };
        return <Badge className={badge.className}>{badge.label}</Badge>;
      },
      enableColumnFilter: true,
      meta: {
        label: 'Tipe',
        variant: 'multiSelect',
        options: [
          { label: 'Teks', value: 'text' },
          { label: 'Foto', value: 'photo' },
          { label: 'Dokumen', value: 'document' }
        ]
      }
    },
    {
      id: 'response_text',
      accessorKey: 'response_text',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Balasan / Media' />,
      cell: ({ row }) => {
        const cmd = row.original;
        return (
          <div className='flex items-center gap-3'>
            {cmd.response_type === 'photo' && cmd.file_url && (
              <a href={cmd.file_url} target='_blank' rel='noopener noreferrer' className='shrink-0'>
                <Image
                  src={cmd.file_url}
                  alt='Preview'
                  width={40}
                  height={40}
                  className='size-10 rounded-md object-cover'
                />
              </a>
            )}
            {cmd.response_type === 'document' && cmd.file_url && (
              <Button variant='outline' size='sm' asChild className='shrink-0'>
                <a href={cmd.file_url} target='_blank' rel='noopener noreferrer'>
                  <Icons.fileTypePdf className='mr-1.5 size-4' />
                  Lihat PDF
                </a>
              </Button>
            )}
            <span className='max-w-[200px] truncate text-sm text-muted-foreground'>
              {cmd.response_text}
            </span>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false
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
      cell: ({ row }) => <StatusCell cmd={row.original} />,
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'status',
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
      enableColumnFilter: false
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onEdit={onEdit} />
    }
  ];
}
