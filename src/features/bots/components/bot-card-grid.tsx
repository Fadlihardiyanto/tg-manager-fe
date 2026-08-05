// ============================================================
// Bot Card Grid — Client Component (card grid view)
// ============================================================
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenantPath } from '@/lib/tenant-path';

import { AlertModal } from '@/components/modal/alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

import { deleteBotMutation, updateBotMutation } from '../api/mutations';
import { botKeys, botsQueryOptions } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import type { BotRole, TelegramBot } from '../api/types';
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
  search?: string;
}

export function BotCardGrid({ onEdit, search = '' }: BotCardGridProps) {
  const { data: botsData } = useSuspenseQuery(botsQueryOptions());
  const { data: groupsData } = useSuspenseQuery(groupsQueryOptions());

  const bots = botsData.data ?? [];
  const groups = groupsData.data ?? [];

  // Filter by search
  const query = search.toLowerCase().trim();
  const filtered = query ? bots.filter((b) => b.username.toLowerCase().includes(query)) : bots;

  // Compute group counts per bot
  const groupCountByBotId = new Map<string, number>();
  for (const group of groups) {
    if (!group.is_active) continue;
    groupCountByBotId.set(group.bot_id, (groupCountByBotId.get(group.bot_id) ?? 0) + 1);
  }

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
    <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
      {filtered.map((bot, i) => (
        <BotCard
          key={bot.id}
          bot={bot}
          groupCount={groupCountByBotId.get(bot.id) ?? 0}
          onEdit={onEdit}
          index={i}
        />
      ))}
    </div>
  );
}

interface BotCardProps {
  bot: TelegramBot;
  groupCount: number;
  onEdit: (bot: TelegramBot) => void;
  index: number;
}

function BotCard({ bot, groupCount, onEdit, index }: BotCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getTenantHref } = useTenantPath();

  const deleteMutation = useMutation({
    ...deleteBotMutation,
    onSuccess: () => {
      toast.success('Bot berhasil dihapus');
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: botKeys.all });
    },
    onError: () => {
      toast.error('Gagal menghapus bot');
    }
  });

  const toggleActiveMutation = useMutation({
    ...updateBotMutation,
    onSuccess: () => {
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

        <div className='flex flex-1 flex-col p-5'>
          {/* Top row: avatar + identity + dropdown */}
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
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
              <div>
                <h6 className='text-base font-semibold'>
                  <button
                    type='button'
                    onClick={() => router.push(getTenantHref(`/dashboard/bots/${bot.id}`))}
                    className='hover:text-primary hover:underline transition-colors text-left'
                  >
                    @{bot.username}
                  </button>
                </h6>
                <p className='text-xs text-muted-foreground'>ID: {bot.telegram_bot_id}</p>
              </div>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='size-8 opacity-60 hover:opacity-100'>
                  <Icons.ellipsis className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => onEdit(bot)}>
                  <Icons.edit className='mr-2 size-4' />
                  Ubah
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setToggleOpen(true)}>
                  {bot.is_active ? (
                    <Icons.circleX className='mr-2 size-4' />
                  ) : (
                    <Icons.circleCheck className='mr-2 size-4' />
                  )}
                  {bot.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(getTenantHref(`/dashboard/bots/${bot.id}`))}
                >
                  <Icons.network className='mr-2 size-4' />
                  Jaringan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Icons.trash className='mr-2 size-4' />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges: status + role */}
          <div className='mt-4 flex items-center gap-2.5'>
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
