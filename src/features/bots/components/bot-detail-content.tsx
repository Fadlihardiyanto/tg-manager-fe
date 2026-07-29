'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

import { botByIdQueryOptions, botKeys } from '@/features/bots/api/queries';
import { deleteBotMutation, updateBotMutation } from '@/features/bots/api/mutations';
import { groupsQueryOptions, groupKeys } from '@/features/groups/api/queries';
import { disconnectGroupMutation, syncGroupsMutation } from '@/features/groups/api/mutations';
import { BOT_ROLE_LABELS } from '@/features/bots/api/types';
import type { BotRole } from '@/features/bots/api/types';
import type { TelegramGroup } from '@/features/groups/api/types';
import { BotFormDialog } from './bot-form-dialog';
import { BotTreeViz } from './bot-tree-viz';
import { BotDetailSkeleton } from './bot-detail-skeleton';
import { useConnectFlow } from '@/features/groups/components/use-connect-flow';

const BOT_ROLE_STYLES: Record<BotRole, string> = {
  sales_only: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  gatekeeper_only: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
  all_in_one: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
};

export default function BotDetailContent({ botId }: { botId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: botData, isLoading: botLoading } = useQuery(botByIdQueryOptions(botId));
  const { data: groupsData, isLoading: groupsLoading } = useQuery(groupsQueryOptions());

  const isLoading = botLoading || groupsLoading;
  const bot = botData?.data ?? null;
  const allGroups = groupsData?.data ?? [];
  const connectedGroups = allGroups.filter((g) => g.bot_id === botId && g.is_active);

  const [selectedGroup, setSelectedGroup] = useState<TelegramGroup | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [connectSheetOpen, setConnectSheetOpen] = useState(false);
  const [connectKey, setConnectKey] = useState(0);
  const [disconnectGroupId, setDisconnectGroupId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    ...deleteBotMutation,
    onSuccess: () => {
      toast.success('Bot berhasil dihapus');
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
      router.push('/dashboard/bots');
      router.refresh();
    },
    onError: () => toast.error('Gagal menghapus bot')
  });

  const toggleMutation = useMutation({
    ...updateBotMutation,
    onSuccess: () => {
      toast.success(bot?.is_active ? 'Bot berhasil dinonaktifkan' : 'Bot berhasil diaktifkan');
      setToggleOpen(false);
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    },
    onError: () => toast.error('Gagal memperbarui status bot')
  });

  const disconnectMutation = useMutation({
    ...disconnectGroupMutation,
    onSuccess: () => {
      toast.success('Grup berhasil diputuskan dari bot');
      setSelectedGroup(null);
      setDisconnectGroupId(null);
      void queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: () => toast.error('Gagal memutuskan grup')
  });

  const syncMutation = useMutation({
    ...syncGroupsMutation,
    onSuccess: () => {
      toast.success('Data grup berhasil disinkronkan');
      void queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: () => toast.error('Gagal sinkronisasi grup')
  });

  const handleEditChange = useCallback(
    (open: boolean) => {
      setEditOpen(open);
      if (!open) {
        void queryClient.invalidateQueries({ queryKey: botKeys.all });
      }
    },
    [queryClient]
  );

  const handleConnectSheetChange = useCallback(
    (open: boolean) => {
      setConnectSheetOpen(open);
      if (!open) {
        setConnectKey((k) => k + 1);
        void queryClient.invalidateQueries({ queryKey: groupKeys.all });
      }
    },
    [queryClient]
  );

  if (isLoading) {
    return <BotDetailSkeleton />;
  }

  if (!bot) return null;

  const totalMembers = connectedGroups.reduce((sum, g) => sum + g.member_count, 0);
  const avgMembers =
    connectedGroups.length > 0 ? Math.floor(totalMembers / connectedGroups.length) : 0;
  const disconnectedCount = allGroups.filter((g) => g.bot_id === botId && !g.is_active).length;

  const statsCards = [
    {
      label: 'Grup Aktif',
      value: connectedGroups.length,
      icon: Icons.groups,
      accent: 'from-violet-500/15 via-violet-500/10 to-transparent'
    },
    {
      label: 'Total Anggota',
      value: totalMembers,
      icon: Icons.teams,
      accent: 'from-sky-500/15 via-sky-500/10 to-transparent'
    },
    {
      label: 'Rata-rata Anggota',
      value: avgMembers,
      icon: Icons.chartBar,
      accent: 'from-emerald-500/15 via-emerald-500/10 to-transparent'
    },
    {
      label: 'Grup Terputus',
      value: disconnectedCount,
      icon: Icons.circleX,
      accent:
        disconnectedCount > 0
          ? 'from-amber-500/15 via-amber-500/10 to-transparent'
          : 'from-slate-500/15 via-slate-500/10 to-transparent'
    }
  ];

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(bot.id)}
        loading={deleteMutation.isPending}
      />
      <AlertModal
        isOpen={toggleOpen}
        onClose={() => setToggleOpen(false)}
        onConfirm={() =>
          toggleMutation.mutate({
            id: bot.id,
            values: { is_active: !bot.is_active }
          })
        }
        loading={toggleMutation.isPending}
        confirmVariant='default'
        title={bot.is_active ? 'Nonaktifkan bot?' : 'Aktifkan bot?'}
        description={
          bot.is_active
            ? `Bot @${bot.username} akan berhenti memproses pesan. Anda dapat mengaktifkannya kembali kapan saja.`
            : `Bot @${bot.username} akan mulai memproses pesan. Anda dapat menonaktifkannya kapan saja.`
        }
      />

      <AlertModal
        isOpen={!!disconnectGroupId}
        onClose={() => setDisconnectGroupId(null)}
        onConfirm={() => {
          if (disconnectGroupId) disconnectMutation.mutate(disconnectGroupId);
        }}
        loading={disconnectMutation.isPending}
        title='Putuskan grup dari bot?'
        description='Grup tidak akan lagi dikelola oleh bot ini. Anda dapat menghubungkannya kembali kapan saja.'
      />

      <BotFormDialog bot={bot} open={editOpen} onOpenChange={handleEditChange} />

      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        {/* Bot identity header */}
        <div className='flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div
              className={cn(
                'flex size-14 shrink-0 items-center justify-center rounded-xl',
                bot.is_active
                  ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'
                  : 'bg-muted'
              )}
            >
              <Icons.bot
                className={cn('size-7', bot.is_active ? 'text-primary' : 'text-muted-foreground')}
              />
            </div>
            <div className='min-w-0'>
              <h2 className='text-lg font-semibold'>@{bot.username}</h2>
              <p className='text-sm text-muted-foreground'>ID: {bot.telegram_bot_id}</p>
              <div className='mt-1.5 flex items-center gap-2'>
                <Badge
                  variant={bot.is_active ? 'default' : 'outline'}
                  className={cn(
                    'gap-1.5 font-medium',
                    bot.is_active
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {bot.is_active ? (
                    <Icons.circleCheck className='size-3' />
                  ) : (
                    <Icons.circleX className='size-3' />
                  )}
                  {bot.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <Badge
                  variant='outline'
                  className={cn('font-medium', BOT_ROLE_STYLES[bot.bot_role] ?? '')}
                >
                  {BOT_ROLE_LABELS[bot.bot_role] ?? bot.bot_role}
                </Badge>
              </div>
            </div>
          </div>
          <p className='text-xs text-muted-foreground whitespace-nowrap'>
            Dibuat {formatDate(bot.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats row */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={cn(
                  'rounded-xl border border-border/70 bg-gradient-to-br px-4 py-3 shadow-sm',
                  card.accent
                )}
              >
                <div className='flex items-center justify-between'>
                  <p className='text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60'>
                    {card.label}
                  </p>
                  <Icon className='size-4 text-muted-foreground' />
                </div>
                <p className='mt-1 text-xl font-semibold tabular-nums'>{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Actions toolbar */}
        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => setEditOpen(true)} size='sm' variant='outline'>
            <Icons.edit className='mr-2 h-4 w-4' />
            Edit Bot
          </Button>
          <Button onClick={() => setConnectSheetOpen(true)} size='sm' variant='outline'>
            <Icons.add className='mr-2 h-4 w-4' />
            Hubungkan Grup
          </Button>
          <Button
            onClick={() => syncMutation.mutate()}
            size='sm'
            variant='outline'
            isLoading={syncMutation.isPending}
          >
            <Icons.refresh className='mr-2 h-4 w-4' />
            Sinkron Grup
          </Button>
          <Button onClick={() => setToggleOpen(true)} size='sm' variant='outline'>
            {bot.is_active ? (
              <Icons.circleX className='mr-2 h-4 w-4' />
            ) : (
              <Icons.circleCheck className='mr-2 h-4 w-4' />
            )}
            {bot.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
          <div className='flex-1' />
          <Button
            onClick={() => setDeleteOpen(true)}
            size='sm'
            variant='ghost'
            className='text-destructive hover:bg-destructive/10 hover:text-destructive'
          >
            <Icons.trash className='mr-2 h-4 w-4' />
            Hapus
          </Button>
        </div>

        {/* Tree visualization */}
        <div className='rounded-xl border border-border/70 bg-card p-6 shadow-sm'>
          <BotTreeViz groups={connectedGroups} onGroupClick={setSelectedGroup} />
        </div>
      </div>

      {/* Group detail sheet */}
      <Sheet open={!!selectedGroup} onOpenChange={(v) => !v && setSelectedGroup(null)}>
        <SheetContent className='w-full sm:max-w-[420px]'>
          {selectedGroup && (
            <>
              <SheetHeader>
                <SheetTitle className='flex items-center gap-2'>
                  <Icons.groups className='size-5' />
                  {selectedGroup.name}
                </SheetTitle>
                <SheetDescription>Detail grup terhubung ke @{bot.username}.</SheetDescription>
              </SheetHeader>

              <div className='mt-6 space-y-4'>
                <div className='space-y-3'>
                  <DetailRow label='Chat ID' value={`${selectedGroup.telegram_chat_id}`} />
                  <DetailRow label='Anggota' value={`${selectedGroup.member_count}`} />
                  <DetailRow
                    label='Status'
                    value={
                      <Badge
                        variant={selectedGroup.is_active ? 'default' : 'outline'}
                        className={cn(
                          'gap-1.5',
                          selectedGroup.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'text-muted-foreground'
                        )}
                      >
                        {selectedGroup.is_active ? (
                          <Icons.circleCheck className='size-3' />
                        ) : (
                          <Icons.circleX className='size-3' />
                        )}
                        {selectedGroup.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    }
                  />
                  <DetailRow
                    label='Dibuat'
                    value={formatDate(selectedGroup.created_at, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  />
                </div>

                <div className='flex flex-col gap-2 pt-4 border-t'>
                  <Button variant='outline' size='sm' className='w-full' asChild>
                    <a
                      href={telegramGroupLink(selectedGroup.telegram_chat_id)}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Icons.telegram className='mr-2 h-4 w-4' />
                      Buka di Telegram
                    </a>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => {
                      if (selectedGroup) setDisconnectGroupId(selectedGroup.id);
                    }}
                  >
                    <Icons.close className='mr-2 h-4 w-4' />
                    Putuskan dari Bot
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Connect group sheet */}
      <Sheet open={connectSheetOpen} onOpenChange={handleConnectSheetChange}>
        <SheetContent className='w-full sm:max-w-[480px]'>
          <ConnectSheetContent key={connectKey} botId={bot.id} botUsername={bot.username} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}

function telegramGroupLink(chatId: number) {
  const abs = Math.abs(chatId);
  const id = abs.toString().replace(/^100/, '');
  return `https://t.me/c/${id}/1`;
}

// ─── Connect Group Sheet Content ─────────────────────────────────────

function ConnectSheetContent({ botId, botUsername }: { botId: string; botUsername: string }) {
  const {
    loading,
    copied,
    connectStatus,
    command,
    inviteLink,
    timeString,
    handleGenerate,
    handleCopy
  } = useConnectFlow(botId, botUsername);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  return (
    <div className='flex flex-col min-h-0 flex-1'>
      <SheetHeader>
        <SheetTitle>Hubungkan Grup Baru</SheetTitle>
        <SheetDescription>Hubungkan bot @{botUsername} dengan grup Telegram Anda.</SheetDescription>
      </SheetHeader>

      <div className='mt-6 flex-1 space-y-4'>
        {loading && (
          <div className='space-y-3 animate-pulse'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-4 w-1/3' />
          </div>
        )}

        {connectStatus === 'success' && (
          <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center'>
            <Icons.circleCheck className='mx-auto size-10 text-emerald-500' />
            <p className='mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
              Grup berhasil dihubungkan!
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Bot @{botUsername} kini aktif di grup baru Anda.
            </p>
            <Button
              onClick={handleGenerate}
              isLoading={loading}
              variant='outline'
              className='mt-4 w-full'
            >
              <Icons.add className='mr-2 h-4 w-4' />
              Tambah Grup Lain
            </Button>
          </div>
        )}

        {connectStatus !== 'pending' && connectStatus !== 'success' && !loading && (
          <Button onClick={handleGenerate} isLoading={loading} variant='outline' className='w-full'>
            <Icons.add className='mr-2 h-4 w-4' />
            Tambah Grup ke Bot Ini
          </Button>
        )}

        {connectStatus === 'expired' && (
          <p className='text-center text-sm text-destructive'>
            Kode koneksi sudah kedaluwarsa. Generate ulang untuk mendapatkan kode baru.
          </p>
        )}

        {connectStatus === 'pending' && (
          <div className='space-y-3 rounded-xl border bg-muted/20 p-4'>
            <p className='text-sm font-medium'>Instruksi:</p>
            <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
              <li>
                Masukkan bot ke grup Telegram Anda{' '}
                <a
                  href={inviteLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  (klik di sini)
                </a>
                .
              </li>
              <li>Jadikan bot sebagai Administrator grup.</li>
              <li>Kirim kode berikut di dalam grup:</li>
            </ol>

            <div className='flex items-center gap-2 rounded-lg border bg-background p-2.5'>
              <code className='flex-1 text-sm font-mono font-bold text-primary'>{command}</code>
              <Button size='sm' variant='outline' onClick={handleCopy}>
                <Icons.clipboardCopy className={cn('h-4 w-4', copied && 'text-green-500')} />
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>

            <p className='text-sm'>
              <a
                href={inviteLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-primary hover:underline'
              >
                <Icons.externalLink className='h-4 w-4' />
                Tambahkan Bot ke Grup secara Instan
              </a>
            </p>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Icons.clock className='h-4 w-4' />
              Kode akan kadaluarsa dalam:{' '}
              <span className='font-mono font-bold text-foreground'>{timeString}</span>
            </div>

            <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
              <Icons.spinner className='h-4 w-4 animate-spin' />
              Menunggu konfirmasi di Telegram...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
