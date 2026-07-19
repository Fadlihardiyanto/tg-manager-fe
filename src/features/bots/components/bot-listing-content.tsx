// ============================================================
// Bot Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { BotTable } from './bot-tables';
import { BotFormDialog } from './bot-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { TelegramBot } from '../api/types';

export function BotListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<TelegramBot | null>(null);
  const { hasQuota } = useActivePlan();
  const canCreateBot = hasQuota('bots');

  const handleEdit = useCallback((bot: TelegramBot) => {
    setEditingBot(bot);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Delay clearing to avoid flash
      setTimeout(() => setEditingBot(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingBot(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <BotTable
        onEdit={handleEdit}
        notice={<QuotaCard resource='bots' title='Kuota bot' />}
        toolbarActions={
          <Button onClick={handleAdd} size='sm' disabled={!canCreateBot} className='rounded-full'>
            {canCreateBot ? (
              <Icons.add className='mr-2 h-4 w-4' />
            ) : (
              <Icons.lock className='mr-2 h-4 w-4' />
            )}
            {canCreateBot ? 'Tambah Bot' : 'Limit Tercapai'}
          </Button>
        }
      />

      <BotFormDialog bot={editingBot} open={dialogOpen} onOpenChange={handleDialogChange} />
    </div>
  );
}
