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
import { Icons } from '@/components/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { createBotMutation, updateBotMutation } from '../api/mutations';
import { botKeys } from '../api/queries';
import type { TelegramBot, BotRole } from '../api/types';
import { BOT_ROLE_OPTIONS } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

type BotFormValues = {
  token: string;
  bot_role: string;
  is_active: string;
};

const botFormSchema = z.object({
  token: z.string().min(10, 'Token bot minimal 10 karakter'),
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
      onSubmit: botFormSchema
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
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Bot' : 'Tambah Bot Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui peran dan status bot.'
              : 'Daftarkan bot Telegram baru menggunakan token dari BotFather.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='bot-form-dialog' className='space-y-4'>
            {!isEdit && (
              <FormTextField
                name='token'
                label='Token Bot'
                required
                placeholder='123456789:ABCdefGHIjklMNOpqrSTUvwxYZ'
                validators={{
                  onBlur: z.string().min(10, 'Token bot minimal 10 karakter')
                }}
              />
            )}

            {isEdit && bot && (
              <div className='rounded-xl border bg-muted/40 p-3.5'>
                <div className='flex items-center gap-2 text-sm'>
                  <Icons.bot className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>@{bot.username}</span>
                  <span className='text-muted-foreground'>(ID: {bot.telegram_bot_id})</span>
                </div>
              </div>
            )}

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

            {isEdit && (
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
            )}
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
            {isEdit ? 'Perbarui Bot' : 'Tambah Bot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
