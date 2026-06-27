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
import {
  createDiscountMutation,
  updateDiscountMutation
} from '../api/mutations';
import { discountKeys } from '../api/queries';
import type { MemberDiscount, DiscountType } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (IDR)' }
];

type DiscountFormValues = {
  name: string;
  code: string;
  type: string;
  value: string;
  max_discount: string;
  min_purchase: string;
  max_usage: string;
  max_usage_per_user: string;
  valid_from: string;
  valid_until: string;
};

const discountFormSchema = z.object({
  name: z.string().min(1, 'Discount name is required'),
  code: z.string(),
  type: z.string().min(1, 'Please select a discount type'),
  value: z
    .string()
    .min(1, 'Value is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Value must be a positive number'
    ),
  max_discount: z.string(),
  min_purchase: z.string(),
  max_usage: z.string(),
  max_usage_per_user: z.string(),
  valid_from: z.string(),
  valid_until: z.string()
});

interface DiscountFormDialogProps {
  discount?: MemberDiscount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountFormDialog({
  discount,
  open,
  onOpenChange
}: DiscountFormDialogProps) {
  const isEdit = !!discount;
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...createDiscountMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Discount created successfully');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: discountKeys.all });
      } else {
        toast.error(res.message || 'Failed to create discount');
      }
    },
    onError: () => toast.error('Failed to create discount')
  });

  const updateMutation = useMutation({
    ...updateDiscountMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Discount updated successfully');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: discountKeys.all });
      } else {
        toast.error(res.message || 'Failed to update discount');
      }
    },
    onError: () => toast.error('Failed to update discount')
  });

  const form = useAppForm({
    defaultValues: {
      name: discount?.name ?? '',
      code: discount?.code ?? '',
      type: discount?.type ?? 'percentage',
      value: discount?.value?.toString() ?? '',
      max_discount: discount?.max_discount?.toString() ?? '',
      min_purchase: discount?.min_purchase?.toString() ?? '',
      max_usage: discount?.max_usage?.toString() ?? '-1',
      max_usage_per_user: discount?.max_usage_per_user?.toString() ?? '1',
      valid_from: discount?.valid_from?.slice(0, 16) ?? '',
      valid_until: discount?.valid_until?.slice(0, 16) ?? ''
    } as DiscountFormValues,
    validators: {
      onSubmit: discountFormSchema
    },
    onSubmit: async ({ value }) => {
      const toOptionalNumber = (v: string) =>
        v.trim() === '' ? undefined : Number(v);

      const toOptionalISO = (v: string) =>
        v.trim() === '' ? undefined : new Date(v).toISOString();

      if (isEdit && discount) {
        await updateMutation.mutateAsync({
          id: discount.id,
          values: {
            name: value.name || undefined,
            value: toOptionalNumber(value.value),
            max_discount: toOptionalNumber(value.max_discount),
            min_purchase: toOptionalNumber(value.min_purchase),
            max_usage: toOptionalNumber(value.max_usage),
            max_usage_per_user: toOptionalNumber(value.max_usage_per_user),
            valid_until: toOptionalISO(value.valid_until)
          }
        });
      } else {
        await createMutation.mutateAsync({
          name: value.name,
          code: value.code.trim() || undefined,
          type: value.type as DiscountType,
          value: Number(value.value),
          max_discount: toOptionalNumber(value.max_discount),
          min_purchase: toOptionalNumber(value.min_purchase),
          max_usage: toOptionalNumber(value.max_usage),
          max_usage_per_user: toOptionalNumber(value.max_usage_per_user),
          valid_from: toOptionalISO(value.valid_from),
          valid_until: toOptionalISO(value.valid_until)
        });
      }
    }
  });

  const { FormTextField, FormSelectField } =
    useFormFields<DiscountFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-[560px] max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Discount' : 'Add New Discount'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update discount details. Type and code cannot be changed.'
              : 'Create a promo code for your subscription packages.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form id='discount-form-dialog' className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormTextField
                name='name'
                label='Discount Name'
                required
                placeholder='End of Year Sale'
                validators={{
                  onBlur: z.string().min(1, 'Name is required')
                }}
              />
              <FormTextField
                name='code'
                label='Promo Code'
                placeholder='PROMO2026'
                description='Leave blank to auto-generate.'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormSelectField
                name='type'
                label='Discount Type'
                required
                options={DISCOUNT_TYPE_OPTIONS}
                placeholder='Select type'
                validators={{
                  onBlur: z.string().min(1, 'Please select a type')
                }}
              />
              <FormTextField
                name='value'
                label='Value'
                required
                placeholder='20'
                description='Percentage (0–100) or fixed IDR amount.'
                validators={{
                  onBlur: z
                    .string()
                    .min(1, 'Value is required')
                    .refine(
                      (val) => !isNaN(Number(val)) && Number(val) > 0,
                      'Must be a positive number'
                    )
                }}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormTextField
                name='max_discount'
                label='Max Discount (IDR)'
                placeholder='50000'
                description='Cap for percentage type. Leave blank for no cap.'
              />
              <FormTextField
                name='min_purchase'
                label='Min Purchase (IDR)'
                placeholder='100000'
                description='Minimum order amount required.'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormTextField
                name='max_usage'
                label='Max Usage'
                placeholder='-1'
                description='-1 for unlimited.'
              />
              <FormTextField
                name='max_usage_per_user'
                label='Max Per User'
                placeholder='1'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormTextField
                name='valid_from'
                label='Valid From'
                placeholder='2026-01-01T00:00'
                description='ISO format: YYYY-MM-DDThh:mm (leave blank for immediate).'
              />
              <FormTextField
                name='valid_until'
                label='Valid Until'
                placeholder='2026-12-31T23:59'
                description='ISO format: YYYY-MM-DDThh:mm (leave blank for no expiry).'
              />
            </div>
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
            form='discount-form-dialog'
            isLoading={isPending}
          >
            <Icons.check className='mr-2 h-4 w-4' />
            {isEdit ? 'Update Discount' : 'Add Discount'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
