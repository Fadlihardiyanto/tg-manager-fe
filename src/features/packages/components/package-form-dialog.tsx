'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Icons } from '@/components/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPackageMutation,
  updatePackageMutation,
  associateGroupsMutation
} from '../api/mutations';
import { packageKeys } from '../api/queries';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import type { Package } from '../api/types';
import { toast } from 'sonner';
import { useState } from 'react';
import * as z from 'zod';

type PackageFormValues = {
  name: string;
  price: string;
  duration_days: string;
  is_all_access: boolean;
};

const packageFormSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  duration_days: z
    .string()
    .min(1, 'Duration is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 1,
      'Duration must be a whole number ≥ 1'
    ),
  is_all_access: z.boolean()
});

interface PackageFormDialogProps {
  package_?: Package | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageFormDialog({
  package_,
  open,
  onOpenChange
}: PackageFormDialogProps) {
  const isEdit = !!package_;
  const queryClient = useQueryClient();
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Fetch groups for multi-select (active groups only)
  const { data: groupsData } = useQuery(groupsQueryOptions());
  const activeGroups = (groupsData?.data ?? []).filter((g) => g.is_active);

  const createMutation = useMutation({
    ...createPackageMutation,
    onSuccess: async (res) => {
      if (res.success) {
        // Associate groups if any selected (create mode only)
        if (selectedGroupIds.length > 0 && res.data?.id) {
          await associateMutation.mutateAsync({
            packageId: res.data.id,
            data: { group_ids: selectedGroupIds }
          });
        }
        toast.success('Package created successfully');
        onOpenChange(false);
        form.reset();
        setSelectedGroupIds([]);
        void queryClient.invalidateQueries({ queryKey: packageKeys.all });
      } else {
        toast.error(res.message || 'Failed to create package');
      }
    },
    onError: () => toast.error('Failed to create package')
  });

  const updateMutation = useMutation({
    ...updatePackageMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Package updated successfully');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: packageKeys.all });
      } else {
        toast.error(res.message || 'Failed to update package');
      }
    },
    onError: () => toast.error('Failed to update package')
  });

  const associateMutation = useMutation({
    ...associateGroupsMutation,
    onError: () => toast.error('Failed to associate groups to package')
  });

  const form = useAppForm({
    defaultValues: {
      name: package_?.name ?? '',
      price: package_?.price?.toString() ?? '',
      duration_days: package_?.duration_days?.toString() ?? '',
      is_all_access: package_?.is_all_access ?? false
    } as PackageFormValues,
    validators: {
      onSubmit: packageFormSchema
    },
    onSubmit: async ({ value }) => {
      const payload = {
        name: value.name,
        price: Number(value.price),
        duration_days: Number(value.duration_days),
        is_all_access: value.is_all_access
      };

      if (isEdit && package_) {
        await updateMutation.mutateAsync({
          id: package_.id,
          values: payload
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    }
  });

  const { FormTextField, FormSwitchField } =
    useFormFields<PackageFormValues>();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    associateMutation.isPending;

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          setSelectedGroupIds([]);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-[520px] max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Package' : 'Add New Package'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the package details.'
              : 'Create a new subscription package for group access.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='package-form-dialog' className='space-y-4'>
            <FormTextField
              name='name'
              label='Package Name'
              required
              placeholder='1 Month VIP'
              validators={{
                onBlur: z
                  .string()
                  .min(3, 'Package name must be at least 3 characters')
              }}
            />

            <FormTextField
              name='price'
              label='Price (IDR)'
              required
              placeholder='150000'
              description='Amount in Indonesian Rupiah (e.g. 150000)'
              validators={{
                onBlur: z
                  .string()
                  .min(1, 'Price is required')
                  .refine(
                    (val) => !isNaN(Number(val)) && Number(val) > 0,
                    'Must be a positive number'
                  )
              }}
            />

            <FormTextField
              name='duration_days'
              label='Duration (Days)'
              required
              placeholder='30'
              validators={{
                onBlur: z
                  .string()
                  .min(1, 'Duration is required')
                  .refine(
                    (val) =>
                      !isNaN(Number(val)) &&
                      Number.isInteger(Number(val)) &&
                      Number(val) >= 1,
                    'Must be a whole number ≥ 1'
                  )
              }}
            />

            <FormSwitchField
              name='is_all_access'
              label='All Access'
              description='Grant access to all groups without restriction.'
            />

            {/* Group multi-select (create mode only) */}
            {!isEdit && activeGroups.length > 0 && (
              <FieldGroup>
                <FieldLabel>Associate Groups</FieldLabel>
                <FieldDescription>
                  Select which Telegram groups this package grants access to.
                </FieldDescription>
                <div className='flex flex-col gap-2 rounded-md border p-3 max-h-[160px] overflow-y-auto'>
                  {activeGroups.map((group) => (
                    <label
                      key={group.id}
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <Checkbox
                        checked={selectedGroupIds.includes(group.id)}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <span className='text-sm font-medium'>
                        {group.name}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        ({group.member_count} members)
                      </span>
                    </label>
                  ))}
                </div>
              </FieldGroup>
            )}
          </form.Form>
        </form.AppForm>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              form.reset();
              setSelectedGroupIds([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='package-form-dialog'
            isLoading={isPending}
          >
            <Icons.check className='mr-2 h-4 w-4' />
            {isEdit ? 'Update Package' : 'Add Package'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
