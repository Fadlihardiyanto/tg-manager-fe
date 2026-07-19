'use client';

import { useKBar } from 'kbar';
import { Icons } from '@/components/icons';
import { Button } from './ui/button';

export default function SearchInput() {
  const { query } = useKBar();

  return (
    <div className='w-full space-y-2'>
      <Button
        variant='outline'
        className='bg-muted/35 text-muted-foreground hover:bg-muted/60 relative h-9 w-full justify-start rounded-full border-border/70 text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64'
        onClick={query.toggle}
      >
        <Icons.search className='mr-2 h-4 w-4' />
        Search...
        <kbd className='bg-background pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded-full border px-1.5 font-mono text-[10px] font-medium opacity-100 shadow-xs select-none sm:flex'>
          <span className='text-xs'>Ctrl</span>K
        </kbd>
      </Button>
    </div>
  );
}
