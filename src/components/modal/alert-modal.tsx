'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
  title?: string;
  description?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  confirmVariant = 'destructive',
  title = 'Apakah Anda yakin?',
  description = 'Tindakan ini tidak dapat dibatalkan.'
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal title={title} description={description} isOpen={isOpen} onClose={onClose}>
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Batal
        </Button>
        <Button disabled={loading} variant={confirmVariant} onClick={onConfirm}>
          Lanjutkan
        </Button>
      </div>
    </Modal>
  );
}
