'use client';

import { useCallback, useState } from 'react';
import { CommandTable } from './command-tables';
import { CommandFormDialog } from './command-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { AlertModal } from '@/components/modal/alert-modal';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { Command } from '../api/types';
import { bulkDeleteCommands } from '../api/service';
import { commandKeys } from '../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function CommandListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { hasQuota } = useActivePlan();
  const canCreateCommand = hasQuota('custom_commands');
  const queryClient = useQueryClient();

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

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true);
    try {
      const res = await bulkDeleteCommands(bulkDeleteIds);
      const deleted = res.data?.deleted ?? 0;
      const failed = res.data?.failed ?? [];

      if (res.success && deleted > 0) {
        if (failed.length > 0) {
          toast.error(`${deleted} perintah dihapus, ${failed.length} gagal`);
        } else {
          toast.success(`${deleted} perintah berhasil dihapus`);
        }
      } else if (failed.length > 0) {
        toast.error(`${failed.length} perintah gagal dihapus`);
      } else {
        toast.error(res.message || 'Gagal menghapus perintah');
      }
    } catch {
      toast.error('Gagal menghapus perintah');
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setBulkDeleteIds([]);
    void queryClient.invalidateQueries({ queryKey: commandKeys.all });
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
        title={`Hapus ${bulkDeleteIds.length} perintah?`}
        description={`${bulkDeleteIds.length} perintah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      <CommandTable
        onEdit={handleEdit}
        onBulkDelete={handleBulkDelete}
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
        toolbarActions={
          <Button
            onClick={handleAdd}
            size='sm'
            disabled={!canCreateCommand}
            className='rounded-full'
          >
            {canCreateCommand ? (
              <Icons.add className='mr-2 h-4 w-4' />
            ) : (
              <Icons.lock className='mr-2 h-4 w-4' />
            )}
            {canCreateCommand ? 'Tambah Perintah' : 'Limit Tercapai'}
          </Button>
        }
      />

      <CommandFormDialog
        command={editingCommand}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
