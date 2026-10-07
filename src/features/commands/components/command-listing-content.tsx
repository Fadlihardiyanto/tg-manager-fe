'use client';

import { useCallback, useState } from 'react';
import { CommandTable } from './command-tables';
import { CommandFormDialog } from './command-form-dialog';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { AlertModal } from '@/components/modal/alert-modal';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { Command } from '../api/types';
import { bulkDeleteCommands } from '../api/service';
import { commandKeys } from '../api/queries';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export function CommandListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const { hasQuota } = useActivePlan();
  const canCreateCommand = hasQuota('custom_commands');
  const bulkDelete = useBulkDelete({
    deleteFn: bulkDeleteCommands,
    noun: 'perintah',
    queryKeys: [commandKeys.all]
  });

  const handleEdit = useCallback((cmd: Command) => {
    setEditingCommand(cmd);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingCommand(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingCommand(null);
    setDialogOpen(true);
  }, []);

  return (
    <PageContainer
      pageTitle='Perintah'
      pageHeaderAction={
        <Button onClick={handleAdd} disabled={!canCreateCommand} className='rounded-full'>
          {canCreateCommand ? (
            <Icons.add className='mr-2 h-4 w-4' />
          ) : (
            <Icons.lock className='mr-2 h-4 w-4' />
          )}
          {canCreateCommand ? 'Tambah Perintah' : 'Limit Tercapai'}
        </Button>
      }
    >
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <AlertModal
          isOpen={bulkDelete.confirmOpen}
          onClose={bulkDelete.closeConfirm}
          onConfirm={bulkDelete.confirmDelete}
          loading={bulkDelete.isDeleting}
          title={`Hapus ${bulkDelete.ids.length} perintah?`}
          description={`${bulkDelete.ids.length} perintah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        />

        <CommandTable
          onEdit={handleEdit}
          onBulkDelete={bulkDelete.requestDelete}
          notice={<QuotaCard resource='custom_commands' title='Kuota perintah kustom' />}
          emptyState={
            <div className='flex flex-col items-center gap-3 py-6'>
              <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <Icons.command className='size-7' />
              </div>
              <div className='text-center'>
                <p className='font-semibold text-foreground'>Belum ada perintah</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Buat perintah kustom pertama untuk bot Anda agar bisa merespons otomatis.
                </p>
              </div>
              <Button onClick={handleAdd} size='sm' className='rounded-full'>
                <Icons.add className='mr-2 h-4 w-4' /> Buat Perintah Pertama
              </Button>
            </div>
          }
        />

        <CommandFormDialog
          command={editingCommand}
          open={dialogOpen}
          onOpenChange={handleDialogChange}
        />
      </div>
    </PageContainer>
  );
}
