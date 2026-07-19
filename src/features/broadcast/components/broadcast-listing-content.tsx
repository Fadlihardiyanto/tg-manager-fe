'use client';

import { Suspense, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { BroadcastTable } from './broadcast-tables';
import { BroadcastFormDialog } from './broadcast-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { botsQueryOptions } from '@/features/bots/api/queries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function BroadcastListingContent() {
  const [botId, setBotId] = useQueryState('bot_id', parseAsString);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasQuota } = useActivePlan();

  const { data: botsData, isPending: botsLoading } = useQuery(botsQueryOptions());
  const bots = (botsData?.data ?? []).filter((b) => b.is_active);
  const canCreateBroadcast = hasQuota('broadcasts');

  const handleAdd = () => setDialogOpen(true);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-4 rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-end gap-4'>
          <div className='space-y-1'>
            <Label>Pilih Bot</Label>
            <Select
              value={botId ?? ''}
              onValueChange={(v) => setBotId(v || null)}
              disabled={botsLoading}
            >
              <SelectTrigger className='w-full rounded-full sm:w-[250px]'>
                <SelectValue placeholder={botsLoading ? 'Memuat...' : 'Pilih bot Telegram...'} />
              </SelectTrigger>
              <SelectContent>
                {bots.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    @{b.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {botId && (
        <Suspense fallback={<Skeleton className='h-64 w-full' />}>
          <BroadcastTable
            botId={botId}
            notice={<QuotaCard resource='broadcasts' title='Kuota siaran' />}
            toolbarActions={
              <Button
                onClick={handleAdd}
                size='sm'
                disabled={!canCreateBroadcast}
                className='rounded-full'
              >
                {canCreateBroadcast ? (
                  <Icons.send className='mr-2 h-4 w-4' />
                ) : (
                  <Icons.lock className='mr-2 h-4 w-4' />
                )}
                {canCreateBroadcast ? 'Buat Broadcast' : 'Limit Tercapai'}
              </Button>
            }
          />
        </Suspense>
      )}

      {!botId && (
        <div className='text-muted-foreground flex min-h-64 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center'>
          <div className='mb-4 flex size-14 items-center justify-center rounded-full bg-background shadow-sm'>
            <Icons.telegram className='h-7 w-7 opacity-50' />
          </div>
          <p>Pilih bot untuk melihat riwayat broadcast</p>
        </div>
      )}

      <BroadcastFormDialog botId={botId ?? ''} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
