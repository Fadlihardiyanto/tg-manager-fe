// ============================================================
// Group Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { GroupTable } from './group-tables';
import { GroupFormDialog } from './group-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { TelegramGroup } from '../api/types';

export function GroupListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TelegramGroup | null>(null);

  const handleEdit = useCallback((group: TelegramGroup) => {
    setEditingGroup(group);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Delay clearing to avoid flash
      setTimeout(() => setEditingGroup(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingGroup(null);
    setDialogOpen(true);
  }, []);

  return (
    <>
      <div className='flex justify-end'>
        <Button onClick={handleAdd} size='sm'>
          <Icons.add className='mr-2 h-4 w-4' /> Add Group
        </Button>
      </div>

      <GroupTable onEdit={handleEdit} />

      <GroupFormDialog
        group={editingGroup}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
