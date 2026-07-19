'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type * as React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { activeBillingKeys, billingHistoryKeys } from '../api/queries';
import type { CancelPendingBillingResponse } from '../api/types';

interface CancelPendingBillingButtonProps {
  size?: React.ComponentProps<typeof Button>['size'];
  label?: string;
}

export function CancelPendingBillingButton({
  size,
  label = 'Batalkan'
}: CancelPendingBillingButtonProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tenant/billing/cancel-pending', { method: 'POST' });
      const data = (await response.json()) as CancelPendingBillingResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal membatalkan billing pending.');
      }

      return data;
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Billing pending berhasil dibatalkan.');
      void queryClient.invalidateQueries({ queryKey: activeBillingKeys.all });
      void queryClient.invalidateQueries({ queryKey: billingHistoryKeys.all });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membatalkan billing pending.');
    }
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type='button' size={size} variant='outline' isLoading={mutation.isPending}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan pembayaran?</AlertDialogTitle>
          <AlertDialogDescription>
            Billing pending akan dibatalkan dan Anda bisa memilih paket atau membuat checkout baru.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Jangan batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>Ya, batalkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
