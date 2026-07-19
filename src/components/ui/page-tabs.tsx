'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PageTabItem {
  value: string;
  label: string;
}

interface PageTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: PageTabItem[];
  className?: string;
}

export function PageTabs({ value, onValueChange, items, className }: PageTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('gap-0', className)}>
      <TabsList className='h-auto w-full justify-start gap-7 overflow-x-auto rounded-none border-b border-border/70 bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className='relative h-11 flex-none rounded-none border-0 bg-transparent px-0 pb-3 text-[13px] font-bold text-muted-foreground shadow-none transition-colors after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-[3px] after:rounded-t-full after:bg-primary after:opacity-0 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:opacity-100'
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
