'use client';

import { Suspense, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { BroadcastTable } from './broadcast-tables';
import { BroadcastFormDialog } from './broadcast-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-end justify-between gap-4'>
        <div className='flex items-end gap-4'>
          <div className='space-y-1'>
            <Label>Pilih Bot</Label>
            <Select
              value={botId ?? ''}
              onValueChange={(v) => setBotId(v || null)}
              disabled={botsLoading}
            >
              <SelectTrigger className='w-[250px]'>
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
        <Button onClick={handleAdd} size='sm' disabled={!botId || !canCreateBroadcast}>
          <Icons.send className='mr-2 h-4 w-4' /> Buat Broadcast
        </Button>
      </div>

      <QuotaCard resource='broadcasts' title='Kuota siaran' className='mt-4' />

      {!canCreateBroadcast && (
        <Alert variant='warning' className='mt-4'>
          <Icons.warning />
          <AlertTitle>Kuota siaran penuh</AlertTitle>
          <AlertDescription>
            Anda tidak bisa membuat siaran baru sampai batas paket ditingkatkan.
          </AlertDescription>
        </Alert>
      )}

      {botId && (
        <Suspense fallback={<Skeleton className='h-64 w-full' />}>
          <BroadcastTable botId={botId} />
        </Suspense>
      )}

      {!botId && (
        <div className='flex flex-1 flex-col items-center justify-center text-muted-foreground'>
          <Icons.telegram className='mb-4 h-12 w-12 opacity-30' />
          <p>Pilih bot untuk melihat riwayat broadcast</p>
        </div>
      )}

      <BroadcastFormDialog botId={botId ?? ''} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
