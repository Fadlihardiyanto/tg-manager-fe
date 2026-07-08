// ============================================================
// Discount Listing Content — Client Component (interactive UI)
// ============================================================
'use client';

import { useCallback, useState } from 'react';
import { DiscountTable } from './discount-tables';
import { DiscountFormDialog } from './discount-form-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useActivePlan } from '@/features/billing/components/active-plan-provider';
import type { MemberDiscount } from '../api/types';

export function DiscountListingContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<MemberDiscount | null>(null);
  const { canUseFeature } = useActivePlan();
  const allowDiscountSystem = canUseFeature('allow_discount_system');

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

  return (
    <>
      <div className='flex justify-end'>
        <Button onClick={handleAdd} size='sm' disabled={!allowDiscountSystem}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Discount
        </Button>
      </div>

      {!allowDiscountSystem && (
        <Alert variant='warning' className='mt-4'>
          <Icons.lock />
          <AlertTitle>Discount system terkunci</AlertTitle>
          <AlertDescription>
            Upgrade plan Anda untuk membuat dan mengelola discount.
          </AlertDescription>
        </Alert>
      )}

      <DiscountTable onEdit={handleEdit} />

      <DiscountFormDialog
        discount={editingDiscount}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </>
  );
}
