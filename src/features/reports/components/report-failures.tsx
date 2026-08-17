'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { reportFailuresQueryOptions } from '../api/queries';
import type { ReportFailure } from '../api/types';
import { cn } from '@/lib/utils';

const eventTypeMeta: Record<string, { label: string; className: string }> = {
  'enforcer.kick': {
    label: 'Kick Member',
    className: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
  },
  'expiry.reminder': {
    label: 'Pengingat Kedaluwarsa',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
  },
  'telegram.dm': {
    label: 'DM Aktivasi',
    className: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400'
  }
};

function eventTypeInfo(type: string) {
  return (
    eventTypeMeta[type] ?? {
      label: type,
      className: 'bg-muted text-muted-foreground border-border'
    }
  );
}

export function ReportFailures() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<ReportFailure | null>(null);

  const { data, isError, isFetching } = useQuery({
    ...reportFailuresQueryOptions(date),
    placeholderData: (previous) => previous
  });
  const failures = data?.success ? (data.data ?? []) : [];

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between gap-3'>
        <CardTitle className='text-base'>
          Kegagalan Aksi Otomatis
          {failures.length > 0 && (
            <span className='ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/10 px-2 text-xs font-bold text-red-600 tabular-nums dark:text-red-400'>
              {failures.length}
            </span>
          )}
        </CardTitle>
        <div className='flex items-center gap-2'>
          <Input
            type='date'
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value || today)}
            className='h-9 w-auto rounded-full text-sm'
          />
          <Button
            variant='outline'
            size='icon'
            className='h-9 w-9 rounded-full'
            disabled={isFetching}
            onClick={() => setDate(date)}
            aria-label='Muat ulang daftar kegagalan'
          >
            <Icons.refresh className={cn('size-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {isError ? (
          <p className='p-6 text-center text-sm text-destructive'>Gagal memuat daftar kegagalan.</p>
        ) : failures.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-10 text-center'>
            <Icons.circleCheck className='size-8 text-emerald-600' />
            <p className='text-sm font-medium text-foreground'>Tidak ada kegagalan</p>
            <p className='text-xs text-muted-foreground'>
              Semua aksi otomatis berhasil pada tanggal ini.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Chat ID</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failures.map((f, i) => {
                const meta = eventTypeInfo(f.event_type);
                return (
                  <TableRow
                    key={`${f.created_at}-${i}`}
                    className='cursor-pointer'
                    onClick={() => setSelected(f)}
                  >
                    <TableCell>
                      <Badge variant='outline' className={cn('font-medium', meta.className)}>
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{f.telegram_chat_id ?? '—'}</TableCell>
                    <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                      {f.created_at
                        ? format(new Date(f.created_at), 'dd MMM HH:mm', { locale: idLocale })
                        : '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground max-w-md truncate text-xs'>
                      {f.detail || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {selected && (
                <Badge
                  variant='outline'
                  className={cn(eventTypeInfo(selected.event_type).className)}
                >
                  {eventTypeInfo(selected.event_type).label}
                </Badge>
              )}
              Detail Kegagalan
            </DialogTitle>
            <DialogDescription>
              Pesan error mentah dari Telegram — berguna untuk diagnosis.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>Chat ID:</span>
              <span className='font-mono text-xs'>{selected?.telegram_chat_id ?? '—'}</span>
            </div>
            <div className='text-muted-foreground text-xs'>
              {selected?.created_at
                ? format(new Date(selected.created_at), 'dd MMM yyyy HH:mm:ss', {
                    locale: idLocale
                  })
                : '—'}
            </div>
            <pre className='overflow-x-auto rounded-lg border border-border/70 bg-muted/20 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap'>
              {selected?.detail || '—'}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
