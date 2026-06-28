'use client';

import { useCallback, useState } from 'react';
import { CommandTable } from './command-tables';
import { CommandFormDialog } from './command-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Command } from '../api/types';

export function CommandListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);

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
        <Button onClick={handleAdd} size='sm'>
          <Icons.add className='mr-2 h-4 w-4' /> Tambah Perintah
        </Button>
      </div>

      <CommandTable onEdit={handleEdit} />

      <CommandFormDialog
        command={editingCommand}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
