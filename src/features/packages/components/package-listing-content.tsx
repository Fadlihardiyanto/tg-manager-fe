// ============================================================
// Package Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PackageTable } from './package-tables';
import { PackageFormDialog } from './package-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuotaCard } from '@/features/billing/components/quota-card';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import { groupsQueryOptions } from '@/features/groups/api/queries';
import Link from 'next/link';
import type { Package } from '../api/types';

export function PackageListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { hasQuota } = useActivePlan();

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
    <>
      {!hasActiveGroups && (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4 text-sm'>
          <p className='font-medium text-amber-800'>Anda belum memiliki grup terdaftar.</p>
          <p className='mt-1 text-amber-700'>
            Silakan hubungkan grup Telegram Anda terlebih dahulu sebelum membuat paket jualan.
          </p>
          <Button asChild size='sm' className='mt-3'>
            <Link href='/dashboard/groups'>Hubungkan Grup</Link>
          </Button>
        </div>
      )}

      <div className='flex justify-end'>
        <Button onClick={handleAdd} size='sm' disabled={!hasActiveGroups || !canCreatePackage}>
          <Icons.add className='mr-2 h-4 w-4' /> Tambah Paket
        </Button>
      </div>

      <QuotaCard resource='packages' title='Kuota paket' className='mt-4' />

      <PackageTable onEdit={handleEdit} />

      <PackageFormDialog
        package_={editingPackage}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
