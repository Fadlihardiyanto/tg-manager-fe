'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { useStore } from '@tanstack/react-form';
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
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { Package, PackagesListResponse } from '../api/types';
import { toast } from 'sonner';
import { useState } from 'react';
import * as z from 'zod';

type PackageFormValues = {
  name: string;
  description: string;
  price: string;
  duration_days: string;
  is_all_access: boolean;
};

const packageFormSchema = z.object({
  name: z.string().min(3, 'Nama paket harus minimal 3 karakter'),
  description: z.string(),
  price: z
    .string()
    .min(1, 'Harga wajib diisi')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Harga harus berupa angka positif'),
  duration_days: z
    .string()
    .min(1, 'Durasi wajib diisi')
    .refine(
      (val) => !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 1,
      'Durasi harus berupa bilangan bulat >= 1'
    ),
  is_all_access: z.boolean()
});

interface PackageFormDialogProps {
  package_?: Package | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageFormDialog({ package_, open, onOpenChange }: PackageFormDialogProps) {
  const isEdit = !!package_;
  const queryClient = useQueryClient();
  const { hasQuota } = useActivePlan();
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const canCreatePackage = isEdit || hasQuota('packages');

  // Fetch groups for multi-select (active groups only)
  const { data: groupsData } = useQuery(groupsQueryOptions());
  const activeGroups = (groupsData?.data ?? []).filter((g) => g.is_active);

  const form = useAppForm({
    defaultValues: {
      name: package_?.name ?? '',
      description: package_?.description ?? '',
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
        price: Number(value.price.replace(/\./g, '')),
        duration_days: Number(value.duration_days),
        is_all_access: value.is_all_access,
        ...(value.description.trim() ? { description: value.description.trim() } : {})
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

  const { FormTextField, FormTextareaField, FormSwitchField } = useFormFields<PackageFormValues>();

  const isAllAccess = useStore(form.store, (state) => state.values.is_all_access);

  const syncPackageList = (item: Package) => {
    queryClient.setQueryData<PackagesListResponse | undefined>(packageKeys.list(), (old) => {
      if (!old?.data) {
        return {
          success: true,
          code: 200,
          message: '',
          data: [item]
        };
      }

      const exists = old.data.some((pkg) => pkg.id === item.id);
      const data = exists
        ? old.data.map((pkg) => (pkg.id === item.id ? item : pkg))
        : [item, ...old.data];

      return {
        ...old,
        data
      };
    });
  };

  const createMutation = useMutation({
    ...createPackageMutation,
    onSuccess: async (res) => {
      if (res.success) {
        if (res.data) {
          syncPackageList(res.data);
        }

        // Associate groups if any selected (create mode only)
        if (!isAllAccess && selectedGroupIds.length > 0 && res.data?.id) {
          await associateMutation.mutateAsync({
            packageId: res.data.id,
            data: { group_ids: selectedGroupIds }
          });
        }
        toast.success('Paket berhasil dibuat');
        onOpenChange(false);
        form.reset();
        setSelectedGroupIds([]);
        void queryClient.invalidateQueries({ queryKey: packageKeys.all });
      } else {
        toast.error(res.message || 'Gagal membuat paket');
      }
    },
    onError: () => toast.error('Gagal membuat paket')
  });

  const updateMutation = useMutation({
    ...updatePackageMutation,
    onSuccess: async (res) => {
      if (res.success) {
        if (res.data) {
          syncPackageList(res.data);
        }

        // Associate groups if any selected
        if (!isAllAccess && selectedGroupIds.length > 0 && res.data?.id) {
          await associateMutation.mutateAsync({
            packageId: res.data.id,
            data: { group_ids: selectedGroupIds }
          });
        }
        toast.success('Paket berhasil diperbarui');
        onOpenChange(false);
        form.reset();
        setSelectedGroupIds([]);
        void queryClient.invalidateQueries({ queryKey: packageKeys.all });
      } else {
        toast.error(res.message || 'Gagal memperbarui paket');
      }
    },
    onError: () => toast.error('Gagal memperbarui paket')
  });

  const associateMutation = useMutation({
    ...associateGroupsMutation,
    onError: () => toast.error('Gagal menghubungkan grup ke paket')
  });

  const isPending =
    createMutation.isPending || updateMutation.isPending || associateMutation.isPending;

  function toggleGroup(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
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
      <DialogContent className='sm:max-w-[520px] max-h-[85vh] flex flex-col overflow-hidden p-0 gap-0'>
        <div className='shrink-0 px-6 pt-6'>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Ubah Paket' : 'Tambah Paket Baru'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Perbarui detail paket.' : 'Buat paket langganan baru untuk akses grup.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto px-6 py-4'>
          <form.AppForm>
            <form.Form id='package-form-dialog' className='space-y-4'>
              <FormTextField
                name='name'
                label='Nama Paket'
                required
                placeholder='1 Month VIP'
                validators={{
                  onBlur: z.string().min(3, 'Nama paket harus minimal 3 karakter')
                }}
              />

              <FormTextareaField
                name='description'
                label='Deskripsi'
                placeholder='Akses VIP 30 hari untuk member grup premium.'
                description='Opsional. Deskripsi ini akan ditampilkan ke member Telegram saat mereka melihat atau membeli paket ini.'
                rows={4}
              />

              <FormTextField
                name='price'
                label='Harga (IDR)'
                required
                placeholder='150000'
                description='Nominal dalam Rupiah Indonesia (mis. 150.000)'
                formatDisplay={(val) => {
                  const digits = String(val).replace(/\D/g, '');
                  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                }}
                validators={{
                  onBlur: z
                    .string()
                    .min(1, 'Harga wajib diisi')
                    .refine(
                      (val) => !isNaN(Number(val)) && Number(val) > 0,
                      'Harus berupa angka positif'
                    )
                }}
              />

              <FormTextField
                name='duration_days'
                label='Durasi (Hari)'
                required
                placeholder='30'
                validators={{
                  onBlur: z
                    .string()
                    .min(1, 'Durasi wajib diisi')
                    .refine(
                      (val) =>
                        !isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 1,
                      'Harus berupa bilangan bulat >= 1'
                    )
                }}
              />

              <FormSwitchField
                name='is_all_access'
                label='Akses Penuh'
                description='Berikan akses ke semua grup tanpa batasan.'
              />

              {/* Group multi-select: show only when !is_all_access */}
              {!isAllAccess && activeGroups.length > 0 && (
                <FieldGroup>
                  <FieldLabel>Hubungkan Grup</FieldLabel>
                  <FieldDescription>
                    Pilih grup Telegram mana yang bisa diakses oleh paket ini.
                  </FieldDescription>
                  <div className='flex flex-col gap-2 rounded-xl border bg-muted/30 p-4 max-h-[160px] overflow-y-auto'>
                    {activeGroups.map((group) => (
                      <label key={group.id} className='flex items-center gap-2 cursor-pointer'>
                        <Checkbox
                          className='border'
                          checked={selectedGroupIds.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                        />
                        <span className='text-sm font-medium'>{group.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          ({group.member_count} anggota)
                        </span>
                      </label>
                    ))}
                  </div>
                </FieldGroup>
              )}
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
                setSelectedGroupIds([]);
                onOpenChange(false);
              }}
            >
              Batal
            </Button>
            <Button
              type='submit'
              form='package-form-dialog'
              isLoading={isPending}
              disabled={!canCreatePackage}
            >
              <Icons.check className='mr-2 h-4 w-4' />
              {isEdit ? 'Perbarui Paket' : 'Tambah Paket'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
