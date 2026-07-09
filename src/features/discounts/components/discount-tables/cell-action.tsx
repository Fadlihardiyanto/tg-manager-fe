'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteDiscountMutation, updateDiscountMutation } from '../../api/mutations';
import { discountKeys } from '../../api/queries';
import type { MemberDiscount } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CellActionProps {
  data: MemberDiscount;
  onEdit?: (discount: MemberDiscount) => void;
}

export function CellAction({ data, onEdit }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...deleteDiscountMutation,
    onSuccess: () => {
      toast.success('Diskon berhasil dihapus');
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
    onError: () => {
      toast.error('Gagal menghapus diskon');
    }
  });

  const toggleActiveMutation = useMutation({
    ...updateDiscountMutation,
    onSuccess: () => {
      toast.success(
        data.is_active ? 'Diskon berhasil dinonaktifkan' : 'Diskon berhasil diaktifkan'
      );
      void queryClient.invalidateQueries({ queryKey: discountKeys.all });
    },
    onError: () => {
      toast.error('Gagal memperbarui status diskon');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Buka menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(data)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Ubah Diskon
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() =>
              toggleActiveMutation.mutate({
                id: data.id,
                values: { is_active: !data.is_active }
              })
            }
          >
            {data.is_active ? (
              <>
                <Icons.circleX className='mr-2 h-4 w-4' /> Nonaktifkan
              </>
            ) : (
              <>
                <Icons.circleCheck className='mr-2 h-4 w-4' /> Aktifkan
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => setDeleteOpen(true)}
          >
            <Icons.trash className='mr-2 h-4 w-4' /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
