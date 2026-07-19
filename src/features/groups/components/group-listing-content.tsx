'use client';

import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GroupTable } from './group-tables';
import { GroupFormDialog } from './group-form-dialog';
import { ConnectGroupModal } from './connect-group-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { TelegramGroup } from '../api/types';
import { syncGroupsMutation } from '../api/mutations';
import { toast } from 'sonner';

export function GroupListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TelegramGroup | null>(null);
  const syncMutation = useMutation(syncGroupsMutation);

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

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <GroupTable
        onEdit={handleEdit}
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
              <Icons.refresh className='mr-2 h-4 w-4' /> Sync Groups
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
