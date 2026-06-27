// ============================================================
// Package Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { PackageTable } from './package-tables';
import { PackageFormDialog } from './package-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Package } from '../api/types';

export function PackageListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

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
      <div className='flex justify-end'>
        <Button onClick={handleAdd} size='sm'>
          <Icons.add className='mr-2 h-4 w-4' /> Add Package
        </Button>
      </div>

      <PackageTable onEdit={handleEdit} />

      <PackageFormDialog
        package_={editingPackage}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
