'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      <div className='flex items-center gap-2'>
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='size-9 min-w-9 min-h-9'
                onClick={() => onEdit(data)}
              >
                <Icons.edit className='h-4 w-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ubah Diskon</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-9 min-w-9 min-h-9'
              onClick={() =>
                toggleActiveMutation.mutate({
                  id: data.id,
                  values: { is_active: !data.is_active }
                })
              }
            >
              {data.is_active ? (
                <Icons.circleX className='h-4 w-4 text-muted-foreground hover:text-destructive' />
              ) : (
                <Icons.circleCheck className='h-4 w-4 text-emerald-500 dark:text-emerald-400' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{data.is_active ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='size-9 min-w-9 min-h-9 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => setDeleteOpen(true)}
            >
              <Icons.trash className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hapus</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}
