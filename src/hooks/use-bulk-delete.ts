'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface BulkDeleteResult {
  deleted?: number;
  failed?: unknown[] | number | null;
}

interface UseBulkDeleteOptions {
  deleteFn: (
    ids: string[]
  ) => Promise<{ success: boolean; message?: string; data?: BulkDeleteResult }>;
  noun: string;
  queryKeys: readonly (readonly unknown[])[];
}

export function useBulkDelete({ deleteFn, noun, queryKeys }: UseBulkDeleteOptions) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = useCallback((nextIds: string[]) => {
    setIds(nextIds);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setIds([]);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await deleteFn(ids);
      const deleted = res.data?.deleted ?? 0;
      const failed = res.data?.failed;
      const failedCount =
        typeof failed === 'number' ? failed : Array.isArray(failed) ? failed.length : 0;

      if (res.success && deleted > 0) {
        if (failedCount > 0) {
          toast.error(`${deleted} ${noun} dihapus, ${failedCount} gagal`);
        } else {
          toast.success(`${deleted} ${noun} berhasil dihapus`);
        }
      } else if (failedCount > 0) {
        toast.error(`${failedCount} ${noun} gagal dihapus`);
      } else {
        toast.error(res.message || `Gagal menghapus ${noun}`);
      }
    } catch {
      toast.error(`Gagal menghapus ${noun}`);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setIds([]);
      queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    }
  }, [ids, deleteFn, noun, queryKeys, queryClient]);

  return { confirmOpen, closeConfirm, confirmDelete, requestDelete, ids, isDeleting };
}
