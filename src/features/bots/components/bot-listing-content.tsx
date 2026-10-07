// ============================================================
// Bot Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BotCardGrid } from './bot-card-grid';
import { BotStats } from './bot-stats';
import { BotFormDialog } from './bot-form-dialog';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { TelegramBot } from '../api/types';
import { bulkDeleteBots } from '../api/service';
import { botKeys } from '../api/queries';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export function BotListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<TelegramBot | null>(null);
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const { hasQuota } = useActivePlan();
  const canCreateBot = hasQuota('bots');
  const bulkDelete = useBulkDelete({
    deleteFn: bulkDeleteBots,
    noun: 'bot',
    queryKeys: [botKeys.all]
  });

  const syncSearch = useCallback(
    (value: string) => {
      setSearch(value);
      const sp = new URLSearchParams(searchParams.toString());
      if (value.trim()) sp.set('q', value);
      else sp.delete('q');
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

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
    <PageContainer
      pageTitle='Bot'
      pageHeaderAction={
        <Button onClick={handleAdd} disabled={!canCreateBot} className='rounded-full shrink-0'>
          {canCreateBot ? (
            <Icons.add className='mr-2 h-4 w-4' />
          ) : (
            <Icons.lock className='mr-2 h-4 w-4' />
          )}
          {canCreateBot ? 'Tambah Bot' : 'Limit Tercapai'}
        </Button>
      }
    >
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <AlertModal
          isOpen={bulkDelete.confirmOpen}
          onClose={bulkDelete.closeConfirm}
          onConfirm={bulkDelete.confirmDelete}
          loading={bulkDelete.isDeleting}
          title={`Hapus ${bulkDelete.ids.length} bot?`}
          description={`${bulkDelete.ids.length} bot akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
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
              onChange={(e) => syncSearch(e.target.value)}
              className='h-10 rounded-full pl-9'
            />
            {search && (
              <button
                onClick={() => syncSearch('')}
                aria-label='Bersihkan pencarian'
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <Icons.close className='size-4' />
              </button>
            )}
          </div>
        </div>

        <div className='animate-fade-up-delay-3 flex min-h-0 flex-1 flex-col'>
          <BotCardGrid
            onEdit={handleEdit}
            onBulkDelete={bulkDelete.requestDelete}
            onAdd={handleAdd}
            canCreate={canCreateBot}
            search={search}
          />
        </div>

        <BotFormDialog bot={editingBot} open={dialogOpen} onOpenChange={handleDialogChange} />
      </div>
    </PageContainer>
  );
}
