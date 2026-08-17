// ============================================================
// Bot Card Grid — Client Component (card grid view)
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenantPath } from '@/lib/tenant-path';

import { AlertModal } from '@/components/modal/alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RowSelectionBar } from '@/components/ui/table/row-selection-bar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

import { deleteBotMutation, updateBotMutation } from '../api/mutations';
import { botKeys, botsQueryOptions } from '../api/queries';
import { groupsQueryOptions, groupKeys } from '@/features/groups/api/queries';
import { updateGroupMutation, deleteGroupMutation } from '@/features/groups/api/mutations';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { BotRole, TelegramBot } from '../api/types';
import type { TelegramGroup } from '@/features/groups/api/types';
import { BOT_ROLE_LABELS } from '../api/types';

const BOT_ROLE_STYLES: Record<BotRole, string> = {
  sales_only: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400',
  gatekeeper_only: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
  all_in_one: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
};

const BOT_ROLE_STRIPE: Record<BotRole, string> = {
  sales_only: 'from-sky-400 to-sky-500',
  gatekeeper_only: 'from-violet-400 to-violet-500',
  all_in_one: 'from-amber-400 to-amber-500'
};

interface BotCardGridProps {
  onEdit: (bot: TelegramBot) => void;
  onBulkDelete?: (ids: string[]) => void;
  onAdd?: () => void;
  canCreate?: boolean;
  search?: string;
}

export function BotCardGrid({
  onEdit,
  onBulkDelete,
  onAdd,
  canCreate = true,
  search = ''
}: BotCardGridProps) {
  const { data: botsData } = useSuspenseQuery(botsQueryOptions());
  const { data: groupsData } = useSuspenseQuery(groupsQueryOptions());

  const bots = botsData.data ?? [];
  const groups = groupsData.data ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ponytail: prune selection ids that no longer exist in data (after delete)
  useEffect(() => {
    const validIds = new Set(bots.map((b) => b.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [bots]);

  // Filter by search
  const query = search.toLowerCase().trim();
  const filtered = query ? bots.filter((b) => b.username.toLowerCase().includes(query)) : bots;

  // Compute group counts per bot
  const groupCountByBotId = new Map<string, number>();
  const groupsByBotId = new Map<string, TelegramGroup[]>();
  for (const group of groups) {
    if (!group.is_active) continue;
    groupCountByBotId.set(group.bot_id, (groupCountByBotId.get(group.bot_id) ?? 0) + 1);
    const list = groupsByBotId.get(group.bot_id) ?? [];
    list.push(group);
    groupsByBotId.set(group.bot_id, list);
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  if (bots.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center'>
        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
          <Icons.bot className='size-6 text-muted-foreground' />
        </div>
        <p className='mt-3 font-medium text-foreground'>Belum ada bot</p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Tambahkan bot Telegram pertama Anda untuk mulai mengelola grup.
        </p>
        {onAdd && (
          <Button onClick={onAdd} disabled={!canCreate} className='mt-5 rounded-full'>
            {canCreate ? (
              <Icons.add className='mr-2 h-4 w-4' />
            ) : (
              <Icons.lock className='mr-2 h-4 w-4' />
            )}
            {canCreate ? 'Tambah Bot' : 'Limit Tercapai'}
          </Button>
        )}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center'>
        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
          <Icons.search className='size-6 text-muted-foreground' />
        </div>
        <p className='mt-3 font-medium text-foreground'>Bot tidak ditemukan</p>
        <p className='mt-1 text-sm text-muted-foreground'>
          Tidak ada bot dengan nama &quot;{search}&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {selectedIds.length > 0 && onBulkDelete && (
        <RowSelectionBar
          selectedCount={selectedIds.length}
          noun='bot'
          onClearSelection={clearSelection}
          onDelete={() => onBulkDelete(selectedIds)}
        />
      )}

      <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {filtered.map((bot, i) => (
          <BotCard
            key={bot.id}
            bot={bot}
            groupCount={groupCountByBotId.get(bot.id) ?? 0}
            connectedGroups={groupsByBotId.get(bot.id) ?? []}
            allBots={bots}
            onEdit={onEdit}
            index={i}
            isSelected={selectedIds.includes(bot.id)}
            onToggleSelect={onBulkDelete ? () => toggleSelect(bot.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface BotCardProps {
  bot: TelegramBot;
  groupCount: number;
  connectedGroups: TelegramGroup[];
  allBots: TelegramBot[];
  onEdit: (bot: TelegramBot) => void;
  index: number;
  isSelected: boolean;
  onToggleSelect?: () => void;
}

function BotCard({
  bot,
  groupCount,
  connectedGroups,
  allBots,
  onEdit,
  index,
  isSelected,
  onToggleSelect
}: BotCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getTenantHref } = useTenantPath();

  const deleteMutation = useMutation({
    ...deleteBotMutation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || 'Gagal menghapus bot');
        setDeleteOpen(false);
        return;
      }
      toast.success('Bot berhasil dihapus');
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    },
    onError: () => {
      toast.error('Gagal menghapus bot');
    }
  });

  const moveGroupMutation = useMutation({
    ...updateGroupMutation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || 'Gagal memindahkan grup');
        return;
      }
      toast.success('Grup dipindahkan ke bot lain');
      void queryClient.invalidateQueries({ queryKey: groupKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    }
  });

  const removeGroupMutation = useMutation({
    ...deleteGroupMutation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || 'Gagal menghapus grup');
        return;
      }
      toast.success('Grup dihapus');
      void queryClient.invalidateQueries({ queryKey: groupKeys.all });
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    }
  });

  const [movingGroupId, setMovingGroupId] = useState<string | null>(null);
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<TelegramGroup | null>(null);
  const otherBots = allBots.filter((b) => b.id !== bot.id && b.is_active);

  const handleMoveGroup = async (groupId: string) => {
    const targetBotId = moveTargets[groupId];
    if (!targetBotId) {
      toast.error('Pilih bot tujuan terlebih dahulu');
      return;
    }
    setMovingGroupId(groupId);
    const res = await moveGroupMutation.mutateAsync({
      id: groupId,
      values: { bot_id: targetBotId }
    });
    setMovingGroupId(null);
    if (!res.success) toast.error(res.message || 'Gagal memindahkan grup');
  };

  const toggleActiveMutation = useMutation({
    ...updateBotMutation,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || 'Gagal memperbarui status bot');
        setToggleOpen(false);
        return;
      }
      toast.success(bot.is_active ? 'Bot berhasil dinonaktifkan' : 'Bot berhasil diaktifkan');
      setToggleOpen(false);
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    },
    onError: () => {
      toast.error('Gagal memperbarui status bot');
    }
  });

  const StatusIcon = bot.is_active ? Icons.circleCheck : Icons.circleX;
  const animClass = index < 4 ? `animate-fade-up-delay-${index}` : 'animate-fade-up';
  const toggleTitle = bot.is_active ? 'Nonaktifkan bot?' : 'Aktifkan bot?';
  const toggleDesc = bot.is_active
    ? `Bot @${bot.username} akan berhenti memproses pesan. Anda dapat mengaktifkannya kembali kapan saja.`
    : `Bot @${bot.username} akan mulai memproses pesan. Anda dapat menonaktifkannya kapan saja.`;

  return (
    <>
      {connectedGroups.length > 0 ? (
        <Modal
          title='Hapus Bot?'
          description={`Bot @${bot.username} masih digunakan oleh ${connectedGroups.length} grup. Pindahkan ke bot lain atau hapus grup tersebut sebelum menghapus bot.`}
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
        >
          <div className='space-y-2 pt-2'>
            {connectedGroups.map((group) => (
              <div
                key={group.id}
                className='space-y-2 rounded-lg border border-border/70 px-3 py-2'
              >
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>{group.name}</p>
                    <p className='text-xs text-muted-foreground'>{group.member_count} member</p>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => setConfirmDeleteGroup(group)}
                  >
                    <Icons.trash className='mr-1.5 size-3.5' />
                    Hapus Grup
                  </Button>
                </div>
                {otherBots.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <Select
                      value={moveTargets[group.id] ?? ''}
                      onValueChange={(v) => setMoveTargets((prev) => ({ ...prev, [group.id]: v }))}
                    >
                      <SelectTrigger className='h-8 flex-1 rounded-full text-xs'>
                        <SelectValue placeholder='Pindahkan ke bot...' />
                      </SelectTrigger>
                      <SelectContent>
                        {otherBots.map((b) => (
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
                      onClick={() => void handleMoveGroup(group.id)}
                      disabled={movingGroupId === group.id}
                      isLoading={movingGroupId === group.id}
                    >
                      Pindahkan
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className='flex w-full items-center justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant='destructive' onClick={() => deleteMutation.mutate(bot.id)}>
              Hapus Bot
            </Button>
          </div>
        </Modal>
      ) : (
        <AlertModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMutation.mutate(bot.id)}
          loading={deleteMutation.isPending}
          confirmText='Hapus'
          title='Hapus Bot?'
          description={`Bot @${bot.username} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
      <AlertModal
        isOpen={!!confirmDeleteGroup}
        onClose={() => setConfirmDeleteGroup(null)}
        onConfirm={() => {
          if (confirmDeleteGroup) {
            removeGroupMutation.mutate(confirmDeleteGroup.id);
            setConfirmDeleteGroup(null);
          }
        }}
        loading={removeGroupMutation.isPending}
        title='Hapus Grup?'
        description={`Grup "${confirmDeleteGroup?.name}" akan dihapus permanen beserta riwayatnya. Bot di grup ini tidak lagi mengelola grup tersebut.`}
      />
      <AlertModal
        isOpen={toggleOpen}
        onClose={() => setToggleOpen(false)}
        onConfirm={() =>
          toggleActiveMutation.mutate({
            id: bot.id,
            values: { is_active: !bot.is_active }
          })
        }
        loading={toggleActiveMutation.isPending}
        confirmVariant='default'
        title={toggleTitle}
        description={toggleDesc}
      />

      <div
        className={cn(
          'group relative flex flex-col rounded-xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20',
          !bot.is_active && 'opacity-75',
          isSelected && 'border-primary/60 bg-primary/[0.03]',
          animClass
        )}
      >
        {/* Role accent stripe */}
        <div
          className={cn(
            'h-1.5 w-full rounded-t-xl bg-gradient-to-r',
            BOT_ROLE_STRIPE[bot.bot_role]
          )}
        />

        {onToggleSelect && (
          <div className='absolute left-3 top-3 z-10'>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.()}
              aria-label={`Pilih bot @${bot.username}`}
            />
          </div>
        )}

        <div className={cn('flex flex-1 flex-col px-5 pb-5', onToggleSelect ? 'pt-9' : 'pt-5')}>
          {/* Top row: avatar + identity + actions */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <div className='relative shrink-0'>
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                    bot.is_active
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20'
                      : 'bg-muted'
                  )}
                >
                  <Icons.bot
                    className={cn(
                      'size-7',
                      bot.is_active ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background',
                    bot.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )}
                />
              </div>
              <div className='min-w-0'>
                <h6 className='text-base font-semibold'>
                  <button
                    type='button'
                    onClick={() => router.push(getTenantHref(`/dashboard/bots/${bot.id}`))}
                    className='block max-w-full truncate hover:text-primary hover:underline transition-colors text-left'
                  >
                    @{bot.username}
                  </button>
                </h6>
                <p className='truncate text-xs text-muted-foreground'>ID: {bot.telegram_bot_id}</p>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 opacity-60 hover:opacity-100'
                    onClick={() => onEdit(bot)}
                  >
                    <Icons.edit className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ubah</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 opacity-60 hover:opacity-100'
                    onClick={() => setToggleOpen(true)}
                  >
                    {bot.is_active ? (
                      <Icons.circleX className='size-4 text-muted-foreground' />
                    ) : (
                      <Icons.circleCheck className='size-4 text-emerald-500 dark:text-emerald-400' />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{bot.is_active ? 'Nonaktifkan' : 'Aktifkan'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 opacity-60 hover:opacity-100'
                    onClick={() => router.push(getTenantHref(`/dashboard/bots/${bot.id}`))}
                  >
                    <Icons.network className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Jaringan</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 opacity-60 hover:opacity-100 text-destructive hover:text-destructive'
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Badges: status + role */}
          <div className='mt-4 flex flex-wrap items-center gap-2.5'>
            <Badge
              variant={bot.is_active ? 'default' : 'outline'}
              className={cn(
                'gap-1.5 font-medium transition-all',
                bot.is_active
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              <StatusIcon className='size-3' />
              {bot.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
            <Badge
              variant='outline'
              className={cn('font-medium', BOT_ROLE_STYLES[bot.bot_role] ?? '')}
            >
              {BOT_ROLE_LABELS[bot.bot_role] ?? bot.bot_role}
            </Badge>
          </div>

          {/* Group count */}
          <div className='mt-3'>
            <span className='inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-xs text-muted-foreground'>
              <Icons.groups className='size-3.5' />
              {groupCount > 0 ? (
                <>
                  <span className='font-medium text-foreground tabular-nums'>{groupCount}</span>
                  grup
                </>
              ) : (
                'Belum ada grup'
              )}
            </span>
          </div>

          {/* Footer: created date + Kelola */}
          <div className='mt-auto flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Icons.calendar className='size-3' />
              {formatDate(bot.created_at, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <button
              type='button'
              className='flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80'
              onClick={() => onEdit(bot)}
            >
              Kelola
              <Icons.chevronRight className='size-3' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
