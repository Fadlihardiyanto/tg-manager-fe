// ============================================================
// Bot Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BotCardGrid } from './bot-card-grid';
import { BotStats } from './bot-stats';
import { BotFormDialog } from './bot-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { TelegramBot } from '../api/types';
import { bulkDeleteBots } from '../api/service';
import { botKeys } from '../api/queries';
import { toast } from 'sonner';

export function BotListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<TelegramBot | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const { hasQuota } = useActivePlan();
  const canCreateBot = hasQuota('bots');
  const queryClient = useQueryClient();

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

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true);
    try {
      const res = await bulkDeleteBots(bulkDeleteIds);
      const deleted = res.data?.deleted ?? 0;
      const failed = res.data?.failed ?? [];

      if (res.success && deleted > 0) {
        if (failed.length > 0) {
          toast.error(`${deleted} bot dihapus, ${failed.length} gagal`);
        } else {
          toast.success(`${deleted} bot berhasil dihapus`);
        }
      } else if (failed.length > 0) {
        toast.error(`${failed.length} bot gagal dihapus`);
      } else {
        toast.error(res.message || 'Gagal menghapus bot');
      }
    } catch {
      toast.error('Gagal menghapus bot');
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setBulkDeleteIds([]);
    void queryClient.invalidateQueries({ queryKey: botKeys.all });
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
        title={`Hapus ${bulkDeleteIds.length} bot?`}
        description={`${bulkDeleteIds.length} bot akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      <BotStats />

      <div className='animate-fade-up-delay-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1'>
          <QuotaCard resource='bots' title='Kuota bot' />
        </div>
        <div className='relative flex-1 min-w-0'>
          <Icons.search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Cari bot...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-10 rounded-full pl-9'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='size-4' />
            </button>
          )}
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
        <BotCardGrid
          onEdit={handleEdit}
          onBulkDelete={handleBulkDelete}
          onAdd={handleAdd}
          canCreate={canCreateBot}
          search={search}
        />
      </div>

      <BotFormDialog bot={editingBot} open={dialogOpen} onOpenChange={handleDialogChange} />
    </div>
  );
}
