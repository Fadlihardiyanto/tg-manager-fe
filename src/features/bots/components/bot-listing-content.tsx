// ============================================================
// Bot Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { BotCardGrid } from './bot-card-grid';
import { BotStats } from './bot-stats';
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
      setTimeout(() => setEditingBot(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingBot(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <BotStats />

      <div className='animate-fade-up-delay-3 flex items-center justify-between gap-3'>
        <div className='flex-1'>
          <QuotaCard resource='bots' title='Kuota bot' />
        </div>
        <Button onClick={handleAdd} disabled={!canCreateBot} className='rounded-full shrink-0'>
          {canCreateBot ? (
            <Icons.add className='mr-2 h-4 w-4' />
          ) : (
            <Icons.lock className='mr-2 h-4 w-4' />
          )}
          {canCreateBot ? 'Tambah Bot' : 'Limit Tercapai'}
        </Button>
      </div>

      <div className='animate-fade-up-delay-3 flex min-h-0 flex-1 flex-col'>
        <BotCardGrid onEdit={handleEdit} />
      </div>

      <BotFormDialog bot={editingBot} open={dialogOpen} onOpenChange={handleDialogChange} />
    </div>
  );
}
