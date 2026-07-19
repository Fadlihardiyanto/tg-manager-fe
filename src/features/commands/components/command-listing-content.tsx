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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <CommandTable
        onEdit={handleEdit}
        notice={<QuotaCard resource='custom_commands' title='Kuota perintah kustom' />}
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
