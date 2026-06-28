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
import { updateGroupMutation } from '../api/mutations';
import { groupKeys } from '../api/queries';
import { botsQueryOptions } from '@/features/bots/api/queries';
import type { TelegramGroup } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

type GroupFormValues = {
  bot_id: string;
  name: string;
};

const groupFormSchema = z.object({
  bot_id: z.string().min(1, 'Please select a bot'),
  name: z.string().min(3, 'Group name must be at least 3 characters')
});

interface GroupFormDialogProps {
  group?: TelegramGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupFormDialog({ group, open, onOpenChange }: GroupFormDialogProps) {
  const queryClient = useQueryClient();

  const { data: botsData } = useQuery(botsQueryOptions());
  const activeBots = (botsData?.data ?? []).filter((b) => b.is_active);

  const botOptions = activeBots.map((bot) => ({
    value: bot.id,
    label: `@${bot.username} (${bot.bot_role.replace(/_/g, ' ')})`
  }));

  const updateMutation = useMutation({
    ...updateGroupMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Group updated successfully');
        onOpenChange(false);
        form.reset();
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
      name: group?.name ?? ''
    } as GroupFormValues,
    validators: {
      onSubmit: groupFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!group) return;
      await updateMutation.mutateAsync({
        id: group.id,
        values: {
          bot_id: value.bot_id,
          name: value.name
        }
      });
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<GroupFormValues>();

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
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Update the group name or assigned bot.</DialogDescription>
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

            {group && (
              <div className='rounded-md border bg-muted/50 p-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Icons.teams className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Chat ID:</span>
                  <span className='font-mono font-medium'>{group.telegram_chat_id}</span>
                </div>
              </div>
            )}

            <FormTextField
              name='name'
              label='Group Name'
              required
              placeholder='VIP Trading Group'
              validators={{
                onBlur: z.string().min(3, 'Group name must be at least 3 characters')
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
          <Button type='submit' form='group-form-dialog' isLoading={updateMutation.isPending}>
            <Icons.check className='mr-2 h-4 w-4' />
            Update Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
