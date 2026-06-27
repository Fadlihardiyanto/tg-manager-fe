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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGroupMutation, updateGroupMutation } from '../api/mutations';
import { groupKeys } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';
import type { TelegramGroup } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

type GroupFormValues = {
  bot_id: string;
  telegram_chat_id: string;
  name: string;
};

const groupFormSchema = z.object({
  bot_id: z.string().min(1, 'Please select a bot'),
  telegram_chat_id: z
    .string()
    .min(1, 'Chat ID is required')
    .refine((val) => !isNaN(Number(val)), 'Chat ID must be a number'),
  name: z.string().min(3, 'Group name must be at least 3 characters')
});

interface GroupFormDialogProps {
  group?: TelegramGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupFormDialog({
  group,
  open,
  onOpenChange
}: GroupFormDialogProps) {
  const isEdit = !!group;
  const queryClient = useQueryClient();

  // Fetch bots for the dropdown (active bots only)
  const { data: botsData } = useQuery(botsQueryOptions());
  const activeBots = (botsData?.data ?? []).filter((b) => b.is_active);

  const botOptions = activeBots.map((bot) => ({
    value: bot.id,
    label: `@${bot.username} (${bot.bot_role.replace(/_/g, ' ')})`
  }));

  const createMutation = useMutation({
    ...createGroupMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Group created successfully');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: groupKeys.all });
      } else {
        toast.error(res.message || 'Failed to create group');
      }
    },
    onError: () => toast.error('Failed to create group')
  });

  const updateMutation = useMutation({
    ...updateGroupMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Group updated successfully');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: groupKeys.all });
      } else {
        toast.error(res.message || 'Failed to update group');
      }
    },
    onError: () => toast.error('Failed to update group')
  });

  const form = useAppForm({
    defaultValues: {
      bot_id: group?.bot_id ?? '',
      telegram_chat_id: group?.telegram_chat_id?.toString() ?? '',
      name: group?.name ?? ''
    } as GroupFormValues,
    validators: {
      onSubmit: groupFormSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit && group) {
        await updateMutation.mutateAsync({
          id: group.id,
          values: {
            bot_id: value.bot_id,
            name: value.name
          }
        });
      } else {
        await createMutation.mutateAsync({
          bot_id: value.bot_id,
          telegram_chat_id: Number(value.telegram_chat_id),
          name: value.name
        });
      }
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<GroupFormValues>();

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
          <DialogTitle>{isEdit ? 'Edit Group' : 'Add New Group'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the group name or assigned bot.'
              : 'Register a new Telegram group by providing its Chat ID and assigning a bot.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='group-form-dialog' className='space-y-4'>
            <FormSelectField
              name='bot_id'
              label='Assigned Bot'
              required
              options={botOptions}
              placeholder='Select a bot'
              description='The bot that will manage this group.'
              validators={{
                onBlur: z.string().min(1, 'Please select a bot')
              }}
            />

            {!isEdit && (
              <FormTextField
                name='telegram_chat_id'
                label='Telegram Chat ID'
                required
                placeholder='-1001234567890'
                description='Add @RawDataBot to your group to find the Chat ID.'
                validators={{
                  onBlur: z
                    .string()
                    .min(1, 'Chat ID is required')
                    .refine(
                      (val) => !isNaN(Number(val)),
                      'Chat ID must be a valid number'
                    )
                }}
              />
            )}

            {isEdit && group && (
              <div className='rounded-md border bg-muted/50 p-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Icons.teams className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Chat ID:</span>
                  <span className='font-mono font-medium'>
                    {group.telegram_chat_id}
                  </span>
                </div>
              </div>
            )}

            <FormTextField
              name='name'
              label='Group Name'
              required
              placeholder='VIP Trading Group'
              validators={{
                onBlur: z
                  .string()
                  .min(3, 'Group name must be at least 3 characters')
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
            Cancel
          </Button>
          <Button
            type='submit'
            form='group-form-dialog'
            isLoading={isPending}
          >
            <Icons.check className='mr-2 h-4 w-4' />
            {isEdit ? 'Update Group' : 'Add Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
