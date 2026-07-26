'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  limitOptions: number[];
  label: string;
  onPageChange: (fn: (p: number) => number) => void;
  onLimitChange: (v: string) => void;
  nextDisabled: boolean;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  limitOptions,
  label,
  onPageChange,
  onLimitChange,
  nextDisabled
}: PaginationBarProps) {
  return (
    <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
      <div className='flex items-center gap-2'>
        <label htmlFor='pagination-limit' className='text-muted-foreground text-xs'>
          Tampilkan
        </label>
        <Select value={String(limit)} onValueChange={onLimitChange}>
          <SelectTrigger id='pagination-limit' className='h-8 w-[5rem] text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className='text-muted-foreground text-xs'>per halaman</span>
      </div>

      <div className='flex items-center gap-1'>
        <p className='text-muted-foreground mr-2 text-xs tabular-nums'>
          {total} {label} &middot; {page} / {totalPages || 1}
        </p>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
        >
          <Icons.chevronLeft className='size-4' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= totalPages || nextDisabled}
          onClick={() => onPageChange((p) => Math.min(totalPages || 1, p + 1))}
        >
          <Icons.chevronRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}
