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
import { createDiscountMutation, updateDiscountMutation } from '../api/mutations';
import { discountKeys } from '../api/queries';
import type { MemberDiscount, DiscountType } from '../api/types';
import { toast } from 'sonner';
import * as z from 'zod';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Persentase (%)' },
  { value: 'fixed', label: 'Nominal Tetap (IDR)' }
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
  name: z.string().min(1, 'Nama diskon wajib diisi'),
  code: z.string(),
  type: z.string().min(1, 'Silakan pilih tipe diskon'),
  value: z
    .string()
    .min(1, 'Nilai wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Harus berupa angka positif'),
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

export function DiscountFormDialog({ discount, open, onOpenChange }: DiscountFormDialogProps) {
  const isEdit = !!discount;
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    ...createDiscountMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Diskon berhasil dibuat');
        onOpenChange(false);
        form.reset();
        void queryClient.invalidateQueries({ queryKey: discountKeys.all });
      } else {
        toast.error(res.message || 'Gagal membuat diskon');
      }
    },
    onError: () => toast.error('Gagal membuat diskon')
  });

  const updateMutation = useMutation({
    ...updateDiscountMutation,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Diskon berhasil diperbarui');
        onOpenChange(false);
        void queryClient.invalidateQueries({ queryKey: discountKeys.all });
      } else {
        toast.error(res.message || 'Gagal memperbarui diskon');
      }
    },
    onError: () => toast.error('Gagal memperbarui diskon')
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
      const toOptionalNumber = (v: string) => (v.trim() === '' ? undefined : Number(v));

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

  const { FormTextField, FormSelectField } = useFormFields<DiscountFormValues>();

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0'>
        <div className='shrink-0 px-6 pt-6'>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Ubah Diskon' : 'Tambah Diskon Baru'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Perbarui detail diskon. Tipe dan kode tidak bisa diubah.'
                : 'Buat kode promo untuk paket langganan Anda.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto px-6 py-4'>
          <form.AppForm>
            <form.Form id='discount-form-dialog' className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='name'
                  label='Nama Diskon'
                  required
                  placeholder='Diskon Akhir Tahun'
                  validators={{
                    onBlur: z.string().min(1, 'Nama wajib diisi')
                  }}
                />
                <FormTextField
                  name='code'
                  label='Kode Promo'
                  placeholder='PROMO2026'
                  description='Kosongkan untuk dibuat otomatis.'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormSelectField
                  name='type'
                  label='Tipe Diskon'
                  required
                  options={DISCOUNT_TYPE_OPTIONS}
                  placeholder='Pilih tipe'
                  validators={{
                    onBlur: z.string().min(1, 'Silakan pilih tipe')
                  }}
                />
                <FormTextField
                  name='value'
                  label='Nilai'
                  required
                  placeholder='20'
                  description='Persentase (0-100) atau nominal tetap dalam IDR.'
                  validators={{
                    onBlur: z
                      .string()
                      .min(1, 'Nilai wajib diisi')
                      .refine(
                        (val) => !isNaN(Number(val)) && Number(val) > 0,
                        'Harus berupa angka positif'
                      )
                  }}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='max_discount'
                  label='Maks Diskon (IDR)'
                  placeholder='50000'
                  description='Batas maksimum untuk tipe persentase. Kosongkan jika tanpa batas.'
                />
                <FormTextField
                  name='min_purchase'
                  label='Minimum Pembelian (IDR)'
                  placeholder='100000'
                  description='Nominal minimum pesanan yang dibutuhkan.'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='max_usage'
                  label='Maks Pemakaian'
                  placeholder='-1'
                  description='-1 untuk tidak terbatas.'
                />
                <FormTextField
                  name='max_usage_per_user'
                  label='Maks per Pengguna'
                  placeholder='1'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormTextField
                  name='valid_from'
                  label='Berlaku Dari'
                  placeholder='2026-01-01T00:00'
                  description='Format ISO: YYYY-MM-DDThh:mm (kosongkan untuk langsung berlaku).'
                />
                <FormTextField
                  name='valid_until'
                  label='Berlaku Sampai'
                  placeholder='2026-12-31T23:59'
                  description='Format ISO: YYYY-MM-DDThh:mm (kosongkan jika tidak ada kedaluwarsa).'
                />
              </div>
            </form.Form>
          </form.AppForm>
        </div>

        <div className='shrink-0 border-t border-border/70 px-6 py-4 bg-background'>
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
            <Button type='submit' form='discount-form-dialog' isLoading={isPending}>
              <Icons.check className='mr-2 h-4 w-4' />
              {isEdit ? 'Perbarui Diskon' : 'Tambah Diskon'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
