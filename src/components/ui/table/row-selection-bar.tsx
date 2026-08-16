'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface RowSelectionBarProps {
  selectedCount: number;
  noun: string;
  onClearSelection: () => void;
  onDelete: () => void;
}

export function RowSelectionBar({
  selectedCount,
  noun,
  onClearSelection,
  onDelete
}: RowSelectionBarProps) {
  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm font-medium text-primary'>
        {selectedCount} {noun} dipilih
      </span>
      <div className='flex gap-2'>
        <Button variant='outline' size='sm' className='rounded-full' onClick={onClearSelection}>
          Batal Pilih
        </Button>
        <Button variant='destructive' size='sm' className='rounded-full' onClick={onDelete}>
          <Icons.trash className='mr-2 h-4 w-4' />
          Hapus {selectedCount} {noun}
        </Button>
      </div>
    </div>
  );
}
