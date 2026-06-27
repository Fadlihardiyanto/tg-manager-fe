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
import { createBotMutation, updateBotMutation } from '../api/mutations';
import { botKeys } from '../api/queries';
import type { TelegramBot, BotRole } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

const BOT_ROLE_OPTIONS = [
  { value: 'all_in_one', label: 'All-in-One' },
  { value: 'sales_only', label: 'Sales Only' },
  { value: 'gatekeeper_only', label: 'Gatekeeper Only' }
];

type BotFormValues = {
  token: string;
  bot_role: string;
  is_active: string;
};

const botFormSchema = z.object({
  token: z.string(),
  bot_role: z.string().min(1, 'Please select a bot role'),
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

  const createMutation = useMutation({
    ...createBotMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Bot created successfully');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: botKeys.all });
      } else {
        toast.error(res.message || 'Failed to create bot');
      }
    },
    onError: () => toast.error('Failed to create bot')
  });

  const updateMutation = useMutation({
    ...updateBotMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Bot updated successfully');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: botKeys.all });
      } else {
        toast.error(res.message || 'Failed to update bot');
      }
    },
    onError: () => toast.error('Failed to update bot')
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
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) form.reset();
      onOpenChange(v);
    }}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Bot' : 'Add New Bot'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the bot role and status.'
              : 'Register a new Telegram bot using its token from BotFather.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='bot-form-dialog' className='space-y-4'>
            {!isEdit && (
              <FormTextField
                name='token'
                label='Bot Token'
                required
                placeholder='123456789:ABCdefGHIjklMNOpqrSTUvwxYZ'
                validators={{
                  onBlur: z
                    .string()
                    .min(10, 'Bot token must be at least 10 characters')
                }}
              />
            )}

            {isEdit && bot && (
              <div className='rounded-md border bg-muted/50 p-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Icons.bot className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>@{bot.username}</span>
                  <span className='text-muted-foreground'>
                    (ID: {bot.telegram_bot_id})
                  </span>
                </div>
              </div>
            )}

            <FormSelectField
              name='bot_role'
              label='Bot Role'
              required
              options={BOT_ROLE_OPTIONS}
              placeholder='Select bot role'
              validators={{
                onBlur: z.string().min(1, 'Please select a bot role')
              }}
            />

            {isEdit && (
              <FormSelectField
                name='is_active'
                label='Status'
                required
                options={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' }
                ]}
                placeholder='Select status'
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
            Cancel
          </Button>
          <Button type='submit' form='bot-form-dialog' isLoading={isPending}>
            <Icons.check className='mr-2 h-4 w-4' />
            {isEdit ? 'Update Bot' : 'Add Bot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
