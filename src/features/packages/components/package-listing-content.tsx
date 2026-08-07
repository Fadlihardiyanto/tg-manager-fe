// ============================================================
// Package Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { PackageTable } from './package-tables';
import { PackageFormDialog } from './package-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import { useTenantPath } from '@/lib/tenant-path';
import Link from 'next/link';
import type { Package } from '../api/types';
import { bulkDeletePackages } from '../api/service';
import { packageKeys } from '../api/queries';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function PackageListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { hasQuota } = useActivePlan();
  const { getTenantHref } = useTenantPath();
  const queryClient = useQueryClient();

  const { data: groupsData } = useSuspenseQuery(groupsQueryOptions());
  const hasActiveGroups = (groupsData?.data ?? []).some((g) => g.is_active);
  const canCreatePackage = hasQuota('packages');

  const handleEdit = useCallback((pkg: Package) => {
    setEditingPackage(pkg);
    setDialogOpen(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingPackage(null), 200);
    }
  }, []);

  const handleAdd = useCallback(() => {
    setEditingPackage(null);
    setDialogOpen(true);
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true);
    try {
      const res = await bulkDeletePackages(bulkDeleteIds);
      const deleted = res.data?.deleted ?? 0;
      const failed = res.data?.failed ?? [];

      if (res.success && deleted > 0) {
        if (failed.length > 0) {
          toast.error(`${deleted} paket dihapus, ${failed.length} gagal`);
        } else {
          toast.success(`${deleted} paket berhasil dihapus`);
        }
      } else if (failed.length > 0) {
        toast.error(`${failed.length} paket gagal dihapus`);
      } else {
        toast.error(res.message || 'Gagal menghapus paket');
      }
    } catch {
      toast.error('Gagal menghapus paket');
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setBulkDeleteIds([]);
    void queryClient.invalidateQueries({ queryKey: packageKeys.all });
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
        title={`Hapus ${bulkDeleteIds.length} paket?`}
        description={`${bulkDeleteIds.length} paket akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
      />

      {!hasActiveGroups && (
        <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10'>
          <p className='font-medium text-amber-800'>Anda belum memiliki grup terdaftar.</p>
          <p className='mt-1 text-amber-700'>
            Silakan hubungkan grup Telegram Anda terlebih dahulu sebelum membuat paket jualan.
          </p>
          <Button asChild size='sm' className='mt-3'>
            <Link href={getTenantHref('/dashboard/groups')}>Hubungkan Grup</Link>
          </Button>
        </div>
      )}

      <PackageTable
        onEdit={handleEdit}
        onBulkDelete={handleBulkDelete}
        notice={<QuotaCard resource='packages' title='Kuota paket' />}
        toolbarActions={
          <>
            {canCreatePackage ? (
              hasActiveGroups ? (
                <Button onClick={handleAdd} size='sm' className='rounded-full'>
                  <Icons.add className='mr-2 h-4 w-4' />
                  Tambah Paket
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button onClick={handleAdd} size='sm' disabled className='rounded-full'>
                        <Icons.add className='mr-2 h-4 w-4' />
                        Tambah Paket
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Hubungkan grup terlebih dahulu</TooltipContent>
                </Tooltip>
              )
            ) : (
              <Button asChild size='sm' className='rounded-full'>
                <Link href={getTenantHref('/dashboard/billing')}>
                  <Icons.lock className='mr-2 h-4 w-4' />
                  Upgrade Paket
                </Link>
              </Button>
            )}
          </>
        }
      />

      <PackageFormDialog
        package_={editingPackage}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  );
}
