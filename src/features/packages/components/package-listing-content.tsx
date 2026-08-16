// ============================================================
// Package Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PackageTable } from './package-tables';
import { PackageFormDialog } from './package-form-dialog';
import PageContainer from '@/components/layout/page-container';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBulkDelete } from '@/hooks/use-bulk-delete';

export function PackageListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { hasQuota } = useActivePlan();
  const { getTenantHref } = useTenantPath();
  const bulkDelete = useBulkDelete({
    deleteFn: bulkDeletePackages,
    noun: 'paket',
    queryKeys: [packageKeys.all]
  });

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

  return (
    <PageContainer
      pageTitle='Paket'
      pageDescription='Kelola paket langganan dan harga'
      pageHeaderAction={
        canCreatePackage ? (
          hasActiveGroups ? (
            <Button onClick={handleAdd} className='rounded-full'>
              <Icons.add className='mr-2 h-4 w-4' />
              Tambah Paket
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={handleAdd} disabled className='rounded-full'>
                    <Icons.add className='mr-2 h-4 w-4' />
                    Tambah Paket
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Hubungkan grup terlebih dahulu</TooltipContent>
            </Tooltip>
          )
        ) : (
          <Button asChild className='rounded-full'>
            <Link href={getTenantHref('/dashboard/billing')}>
              <Icons.lock className='mr-2 h-4 w-4' />
              Upgrade Paket
            </Link>
          </Button>
        )
      }
    >
      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <AlertModal
          isOpen={bulkDelete.confirmOpen}
          onClose={bulkDelete.closeConfirm}
          onConfirm={bulkDelete.confirmDelete}
          loading={bulkDelete.isDeleting}
          title={`Hapus ${bulkDelete.ids.length} paket?`}
          description={`${bulkDelete.ids.length} paket akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
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
          onBulkDelete={bulkDelete.requestDelete}
          notice={<QuotaCard resource='packages' title='Kuota paket' />}
        />

        <PackageFormDialog
          package_={editingPackage}
          open={dialogOpen}
          onOpenChange={handleDialogChange}
        />
      </div>
    </PageContainer>
  );
}
