'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useConnectFlow } from './use-connect-flow';
import type { TelegramBot } from '@/features/bots/api/types';

interface GroupTransferRowProps {
  allBots: TelegramBot[];
}

const STATUS_TEXT: Record<string, string> = {
  pending: 'Menunggu konfirmasi di Telegram…',
  success: 'Grup berhasil dipindahkan!',
  expired: 'Kode kedaluwarsa — buat ulang.'
};

export function GroupTransferRow({ allBots }: GroupTransferRowProps) {
  const [targetBotId, setTargetBotId] = useState('');
  const targetBot = allBots.find((b) => b.id === targetBotId);
  const flow = useConnectFlow(targetBotId, targetBot?.username ?? '', 'transfer');

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Select
          value={targetBotId}
          onValueChange={(v) => {
            setTargetBotId(v);
            flow.reset();
          }}
        >
          <SelectTrigger className='h-8 flex-1 rounded-full text-xs'>
            <SelectValue placeholder='Pindahkan ke bot...' />
          </SelectTrigger>
          <SelectContent>
            {allBots.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                @{b.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size='sm'
          variant='outline'
          className='shrink-0 rounded-full'
          disabled={!targetBotId || !!flow.token}
          onClick={() => void flow.handleGenerate()}
          isLoading={flow.loading}
        >
          Buat Kode
        </Button>
      </div>

      {flow.token && (
        <div className='space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <code className='min-w-0 truncate font-mono text-xs'>{flow.command || '…'}</code>
            <Button
              size='sm'
              variant='ghost'
              className='shrink-0 rounded-full'
              onClick={() => void flow.handleCopy()}
            >
              <Icons.clipboardCopy
                className={flow.copied ? 'mr-1.5 size-3.5 text-emerald-600' : 'mr-1.5 size-3.5'}
              />
              {flow.copied ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
          <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            {flow.connectStatus === 'pending' ? (
              <Icons.spinner className='size-3 animate-spin' />
            ) : flow.connectStatus === 'success' ? (
              <Icons.circleCheck className='size-3 text-emerald-600' />
            ) : (
              <Icons.clock className='size-3' />
            )}
            {flow.connectStatus
              ? STATUS_TEXT[flow.connectStatus]
              : 'Jalankan perintah di grup Telegram.'}
            {flow.connectStatus !== 'success' && flow.secondsLeft > 0 && (
              <span className='ml-auto tabular-nums'>
                {Math.floor(flow.secondsLeft / 60)}:{String(flow.secondsLeft % 60).padStart(2, '0')}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
