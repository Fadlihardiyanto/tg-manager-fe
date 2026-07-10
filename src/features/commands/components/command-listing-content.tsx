'use client';

import { useCallback, useState } from 'react';
import { CommandTable } from './command-tables';
import { CommandFormDialog } from './command-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { Command } from '../api/types';

export function CommandListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const { hasQuota } = useActivePlan();
  const canCreateCommand = hasQuota('custom_commands');

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
    <>
      <div className='flex justify-end'>
        <Button onClick={handleAdd} size='sm' disabled={!canCreateCommand}>
          <Icons.add className='mr-2 h-4 w-4' /> Tambah Perintah
        </Button>
      </div>

      <QuotaCard resource='custom_commands' title='Kuota perintah kustom' className='mt-4' />

      <CommandTable onEdit={handleEdit} />

      <CommandFormDialog
        command={editingCommand}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
