'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { deleteGroupMutation } from '../../api/mutations';
import { groupKeys } from '../../api/queries';
import type { TelegramGroup } from '../../api/types';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CellActionProps {
  data: TelegramGroup;
  onEdit?: (group: TelegramGroup) => void;
}

export function CellAction({ data, onEdit }: CellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...deleteGroupMutation,
    onSuccess: () => {
      toast.success('Grup berhasil dihapus');
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: () => {
      toast.error('Gagal menghapus grup');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(data.id)}
        loading={deleteMutation.isPending}
        title='Hapus grup?'
        description={`Grup "${data.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
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
            <TooltipContent>Ubah Grup</TooltipContent>
          </Tooltip>
        )}
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
