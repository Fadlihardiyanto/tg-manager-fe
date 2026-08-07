// ============================================================
// Discount Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { DiscountTable } from './discount-tables';
import { DiscountFormDialog } from './discount-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { MemberDiscount } from '../api/types';
import { bulkDeleteDiscounts } from '../api/service';
import { discountKeys } from '../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTenantPath } from '@/lib/tenant-path';

export function DiscountListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<MemberDiscount | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { canUseFeature } = useActivePlan();
  const { getTenantHref } = useTenantPath();
  const allowDiscountSystem = canUseFeature('allow_discount_system');
  const queryClient = useQueryClient();

  const handleEdit = useCallback((discount: MemberDiscount) => {
    setEditingDiscount(discount);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingDiscount(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingDiscount(null);
    setDialogOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true);
    try {
      const res = await bulkDeleteDiscounts(bulkDeleteIds);
      const deleted = res.data?.deleted ?? 0;
      const failed = res.data?.failed ?? [];

      if (res.success && deleted > 0) {
        if (failed.length > 0) {
          toast.error(`${deleted} diskon dihapus, ${failed.length} gagal`);
        } else {
          toast.success(`${deleted} diskon berhasil dihapus`);
        }
      } else if (failed.length > 0) {
        toast.error(`${failed.length} diskon gagal dihapus`);
      } else {
        toast.error(res.message || 'Gagal menghapus diskon');
      }
    } catch {
      toast.error('Gagal menghapus diskon');
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setBulkDeleteIds([]);
    void queryClient.invalidateQueries({ queryKey: discountKeys.all });
  }, [bulkDeleteIds, queryClient]);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <AlertModal
        isOpen={bulkDeleteOpen}
        onClose={() => {
          setBulkDeleteOpen(false);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleBulkDeleteConfirm}
        loading={bulkDeleting}
        title={`Hapus ${bulkDeleteIds.length} diskon?`}
        description={`${bulkDeleteIds.length} diskon akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      <div className='relative flex min-h-0 flex-1'>
        <div
          className={
            allowDiscountSystem
              ? 'flex min-h-0 flex-1'
              : 'pointer-events-none flex min-h-0 flex-1 select-none blur-[2px]'
          }
        >
          <DiscountTable
            onEdit={handleEdit}
            onBulkDelete={handleBulkDelete}
            toolbarActions={
              <Button
                onClick={handleAdd}
                size='sm'
                disabled={!allowDiscountSystem}
                className='rounded-full'
              >
                {allowDiscountSystem ? (
                  <Icons.add className='mr-2 h-4 w-4' />
                ) : (
                  <Icons.lock className='mr-2 h-4 w-4' />
                )}
                {allowDiscountSystem ? 'Tambah Diskon' : 'Fitur Terkunci'}
              </Button>
            }
          />
        </div>

        {!allowDiscountSystem && (
          <div className='absolute inset-0 z-50 flex items-center justify-center bg-background/45 p-4'>
            <div className='w-full max-w-sm rounded-3xl border border-border/70 bg-background p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.14)]'>
              <div className='mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary'>
                <Icons.lock className='size-7' />
              </div>
              <h3 className='text-base font-bold text-foreground'>Buka Sistem Diskon</h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Upgrade plan Anda untuk membuat, mengelola, dan melacak performa diskon.
              </p>
              <Button asChild className='mt-5 rounded-full'>
                <Link href={getTenantHref('/dashboard/billing?tab=upgrade')}>Upgrade Plan</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <DiscountFormDialog
        discount={editingDiscount}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
