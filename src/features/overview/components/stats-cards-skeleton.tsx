import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const accents = [
  'from-emerald-500/15 via-emerald-500/5 to-transparent',
  'from-sky-500/15 via-sky-500/5 to-transparent',
  'from-violet-500/15 via-violet-500/5 to-transparent',
  'from-amber-500/15 via-amber-500/5 to-transparent'
];

export function StatsCardsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {accents.map((accent, i) => (
        <Card
          key={i}
          className={cn(
            '@container/card overflow-hidden border-border/70 bg-gradient-to-br shadow-sm',
            accent
          )}
        >
          <CardHeader className='gap-3'>
            <Skeleton className='h-3 w-32 rounded-full' />
            <Skeleton className='h-8 w-24 rounded' />
            <div className='flex justify-end'>
              <Skeleton className='size-9 rounded-full' />
            </div>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5'>
            <Skeleton className='h-3 w-40 rounded-full' />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
