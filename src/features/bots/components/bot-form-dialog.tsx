'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { createBotMutation, updateBotMutation } from '../api/mutations';
import { botKeys } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import { useConnectFlow } from '@/features/groups/components/use-connect-flow';
import type { TelegramBot, BotRole } from '../api/types';
import { BOT_ROLE_OPTIONS } from '../api/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as z from 'zod';

type BotFormValues = {
  token: string;
  bot_role: string;
  is_active: string;
};

const createBotFormSchema = z.object({
  token: z.string().min(10, 'Token bot minimal 10 karakter'),
  bot_role: z.string().min(1, 'Silakan pilih peran bot'),
  is_active: z.string()
});

const editBotFormSchema = z.object({
  token: z.string(),
  bot_role: z.string().min(1, 'Silakan pilih peran bot'),
  is_active: z.string()
});

interface BotFormDialogProps {
  bot?: TelegramBot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BotFormDialog({ bot, open, onOpenChange }: BotFormDialogProps) {
  const isEdit = !!bot;
  const queryClient = useQueryClient();
  const { hasQuota } = useActivePlan();
  const canCreateBot = isEdit || hasQuota('bots');

  const createMutation = useMutation({
    ...createBotMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Bot berhasil dibuat');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: botKeys.all });
      } else {
        toast.error(res.message || 'Gagal membuat bot');
      }
    },
    onError: () => toast.error('Gagal membuat bot')
  });

  const updateMutation = useMutation({
    ...updateBotMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Bot berhasil diperbarui');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: botKeys.all });
      } else {
        toast.error(res.message || 'Gagal memperbarui bot');
      }
    },
    onError: () => toast.error('Gagal memperbarui bot')
  });

  const form = useAppForm({
    defaultValues: {
      token: '',
      bot_role: bot?.bot_role ?? 'all_in_one',
      is_active: bot?.is_active ? 'true' : 'false'
    } as BotFormValues,
    validators: {
      onSubmit: isEdit ? editBotFormSchema : createBotFormSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit && bot) {
        await updateMutation.mutateAsync({
          id: bot.id,
          values: {
            bot_role: value.bot_role as BotRole,
            is_active: value.is_active === 'true'
          }
        });
      } else {
        await createMutation.mutateAsync({
          token: value.token,
          bot_role: value.bot_role as BotRole
        });
      }
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<BotFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Bot' : 'Tambah Bot Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui peran dan status bot.'
              : 'Daftarkan bot Telegram baru menggunakan token dari BotFather.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && bot ? (
          <BotEditTabs bot={bot} form={form} isPending={isPending} canCreateBot={canCreateBot} />
        ) : (
          <>
            <form.AppForm>
              <form.Form id='bot-form-dialog' className='space-y-4'>
                <FormTextField
                  name='token'
                  label='Token Bot'
                  required
                  placeholder='123456789:ABCdefGHIjklMNOpqrSTUvwxYZ'
                  validators={{
                    onBlur: z.string().min(10, 'Token bot minimal 10 karakter')
                  }}
                />
                <FormSelectField
                  name='bot_role'
                  label='Peran Bot'
                  required
                  options={BOT_ROLE_OPTIONS}
                  placeholder='Pilih peran bot'
                  validators={{
                    onBlur: z.string().min(1, 'Silakan pilih peran bot')
                  }}
                />
              </form.Form>
            </form.AppForm>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Batal
              </Button>
              <Button
                type='submit'
                form='bot-form-dialog'
                isLoading={isPending}
                disabled={!canCreateBot}
              >
                <Icons.check className='mr-2 h-4 w-4' />
                Tambah Bot
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Mode with Tabs ───────────────────────────────────────────────

function BotEditTabs({
  bot,
  form,
  isPending,
  canCreateBot
}: {
  bot: TelegramBot;
  form: ReturnType<typeof useAppForm>;
  isPending: boolean;
  canCreateBot: boolean;
}) {
  return (
    <Tabs defaultValue='settings' className='gap-0'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='settings'>
          <Icons.settings className='size-4' />
          Pengaturan
        </TabsTrigger>
        <TabsTrigger value='groups'>
          <Icons.groups className='size-4' />
          Kelola Grup
        </TabsTrigger>
      </TabsList>

      <TabsContent value='settings' forceMount className='mt-4 data-[state=inactive]:hidden'>
        <SettingsTab bot={bot} form={form} />
        <div className='mt-6 flex items-center justify-end gap-2'>
          <Button type='button' variant='outline' onClick={() => form.reset()}>
            Batal
          </Button>
          <Button
            type='submit'
            form='bot-form-dialog'
            isLoading={isPending}
            disabled={!canCreateBot}
          >
            <Icons.check className='mr-2 h-4 w-4' />
            Perbarui Bot
          </Button>
        </div>
      </TabsContent>

      <TabsContent value='groups' forceMount className='mt-4 data-[state=inactive]:hidden'>
        <GroupsTab bot={bot} />
      </TabsContent>
    </Tabs>
  );
}

// ─── Settings Tab (Pengaturan) ─────────────────────────────────────────

function SettingsTab({ bot, form }: { bot: TelegramBot; form: ReturnType<typeof useAppForm> }) {
  const { FormSelectField } = useFormFields<BotFormValues>();

  return (
    <form.AppForm>
      <form.Form id='bot-form-dialog' className='space-y-4'>
        <div className='rounded-xl border bg-muted/40 p-3.5'>
          <div className='flex items-center gap-2 text-sm'>
            <Icons.bot className='h-4 w-4 text-muted-foreground' />
            <span className='font-medium'>@{bot.username}</span>
            <span className='text-muted-foreground'>(ID: {bot.telegram_bot_id})</span>
          </div>
        </div>

        <FormSelectField
          name='bot_role'
          label='Peran Bot'
          required
          options={BOT_ROLE_OPTIONS}
          placeholder='Pilih peran bot'
          validators={{
            onBlur: z.string().min(1, 'Silakan pilih peran bot')
          }}
        />

        <FormSelectField
          name='is_active'
          label='Status'
          required
          options={[
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' }
          ]}
          placeholder='Pilih status'
        />
      </form.Form>
    </form.AppForm>
  );
}

// ─── Groups Tab (Kelola Grup) ──────────────────────────────────────────

function GroupsTab({ bot }: { bot: TelegramBot }) {
  const { data: groupsData } = useQuery(groupsQueryOptions());
  const allGroups = groupsData?.data ?? [];

  const connectedGroups = allGroups.filter((g) => g.bot_id === bot.id);

  return (
    <div className='space-y-4'>
      {/* Connected groups */}
      <div>
        <h4 className='mb-2 text-sm font-semibold'>Grup Terhubung ({connectedGroups.length})</h4>

        {connectedGroups.length > 0 ? (
          <div className='max-h-[160px] overflow-y-auto rounded-xl border bg-muted/30'>
            {connectedGroups.map((g) => (
              <div
                key={g.id}
                className='flex items-center justify-between border-b border-border/30 px-3.5 py-2.5 text-sm last:border-b-0'
              >
                <div className='flex items-center gap-2 min-w-0'>
                  <Icons.groups className='size-4 shrink-0 text-muted-foreground' />
                  <span className='truncate font-medium'>{g.name}</span>
                </div>
                <span className='ml-2 shrink-0 text-xs text-muted-foreground tabular-nums'>
                  {g.member_count} anggota
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center'>
            <Icons.groups className='size-8 opacity-30' />
            <p className='mt-2 text-sm text-muted-foreground'>
              Belum ada grup terhubung ke bot ini.
            </p>
          </div>
        )}
      </div>

      {/* Connect new group */}
      <ConnectGroupInline botId={bot.id} botUsername={bot.username} />
    </div>
  );
}

// ─── Inline Connect Group Flow ─────────────────────────────────────────

function ConnectGroupInline({ botId, botUsername }: { botId: string; botUsername: string }) {
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

  return (
    <div className='space-y-3'>
      {/* Success state */}
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

      {/* Initial / retry button */}
      {connectStatus !== 'pending' && connectStatus !== 'success' && (
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
  );
}
