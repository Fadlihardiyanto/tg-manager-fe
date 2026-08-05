'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupTable } from './group-tables';
import { GroupFormDialog } from './group-form-dialog';
import { ConnectGroupModal } from './connect-group-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import type { TelegramGroup } from '../api/types';
import { syncGroupsMutation, deleteGroupMutation } from '../api/mutations';
import { groupKeys } from '../api/queries';
import { deleteGroup } from '../api/service';
import { toast } from 'sonner';

export function GroupListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TelegramGroup | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const syncMutation = useMutation(syncGroupsMutation);
  const queryClient = useQueryClient();

  const handleEdit = useCallback((group: TelegramGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingGroup(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setConnectOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true);
    const results = await Promise.allSettled(bulkDeleteIds.map((id) => deleteGroup(id)));
    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = results.length - failed;

    if (succeeded > 0) {
      toast.success(`${succeeded} grup berhasil dihapus`);
    }
    if (failed > 0) {
      toast.error(`${failed} grup gagal dihapus`);
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setBulkDeleteIds([]);
    void queryClient.invalidateQueries({ queryKey: groupKeys.all });
  }, [bulkDeleteIds, queryClient]);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <AlertModal
        isOpen={bulkDeleteOpen}
        onClose={() => {
          setBulkDeleteOpen(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleBulkDeleteConfirm}
        loading={bulkDeleting}
        title={`Hapus ${bulkDeleteIds.length} grup?`}
        description={`${bulkDeleteIds.length} grup akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      <GroupTable
        onEdit={handleEdit}
        onBulkDelete={handleBulkDelete}
        emptyState={
          <div className='flex flex-col items-center gap-3 py-6'>
            <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Icons.teams className='size-7' />
            </div>
            <div className='text-center'>
              <p className='font-semibold text-foreground'>Belum ada grup Telegram terhubung</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                Hubungkan grup pertama Anda untuk mulai mengelola member dan bot.
              </p>
            </div>
            <Button onClick={handleAdd} size='sm' className='rounded-full'>
              <Icons.add className='mr-2 h-4 w-4' /> Hubungkan Grup Pertama
            </Button>
          </div>
        }
        toolbarActions={
          <>
            <Button
              variant='outline'
              size='sm'
              className='rounded-full'
              isLoading={syncMutation.isPending}
              onClick={() => {
                toast.promise(syncMutation.mutateAsync(), {
                  loading: 'Memulai sync groups...',
                  success: (res) => res.message || 'Sync groups dimulai',
                  error: 'Gagal menjalankan sync groups'
                });
              }}
            >
              <Icons.refresh className='mr-2 h-4 w-4' /> Sinkronisasi Grup
            </Button>
            <Button onClick={handleAdd} size='sm' className='rounded-full'>
              <Icons.add className='mr-2 h-4 w-4' /> Tambah Grup Baru
            </Button>
          </>
        }
      />

      <GroupFormDialog group={editingGroup} open={dialogOpen} onOpenChange={handleDialogChange} />

      <ConnectGroupModal open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  );
}
