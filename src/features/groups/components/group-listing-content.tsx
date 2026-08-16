'use client';

import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GroupTable } from './group-tables';
import { GroupFormDialog } from './group-form-dialog';
import { ConnectGroupModal } from './connect-group-modal';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import type { TelegramGroup } from '../api/types';
import { syncGroupsMutation } from '../api/mutations';
import { groupKeys } from '../api/queries';
import { bulkDeleteGroups } from '../api/service';
import { useBulkDelete } from '@/hooks/use-bulk-delete';
import { toast } from 'sonner';

export function GroupListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TelegramGroup | null>(null);
  const syncMutation = useMutation(syncGroupsMutation);
  const bulkDelete = useBulkDelete({
    deleteFn: bulkDeleteGroups,
    noun: 'grup',
    queryKeys: [groupKeys.all]
  });

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

  const handleSync = () => {
    toast.promise(syncMutation.mutateAsync(), {
      loading: 'Memulai sync groups...',
      success: (res) => res.message || 'Sync groups dimulai',
      error: 'Gagal menjalankan sync groups'
    });
  };

  return (
    <PageContainer
      pageTitle='Grup'
      pageDescription='Kelola grup Telegram dan koneksi bot'
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='rounded-full'
            isLoading={syncMutation.isPending}
            onClick={handleSync}
          >
            <Icons.refresh className='mr-2 h-4 w-4' /> Sinkronisasi Grup
          </Button>
          <Button onClick={handleAdd} className='rounded-full'>
            <Icons.add className='mr-2 h-4 w-4' /> Tambah Grup Baru
          </Button>
        </div>
      }
    >
      <AlertModal
        isOpen={bulkDelete.confirmOpen}
        onClose={bulkDelete.closeConfirm}
        onConfirm={bulkDelete.confirmDelete}
        loading={bulkDelete.isDeleting}
        title={`Hapus ${bulkDelete.ids.length} grup?`}
        description={`${bulkDelete.ids.length} grup akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      <GroupTable
        onEdit={handleEdit}
        onBulkDelete={bulkDelete.requestDelete}
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
      />

      <GroupFormDialog group={editingGroup} open={dialogOpen} onOpenChange={handleDialogChange} />

      <ConnectGroupModal open={connectOpen} onOpenChange={setConnectOpen} />
    </PageContainer>
  );
}
