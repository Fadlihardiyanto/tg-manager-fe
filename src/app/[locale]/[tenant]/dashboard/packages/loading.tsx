import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pt-2 pb-3 md:px-4 md:pt-3 md:pb-4'>
      <div className='mb-4'>
        <Skeleton className='h-[28px] w-24 rounded-sm' />
        <Skeleton className='mt-1.5 h-4 w-64 rounded-sm' />
      </div>
      <div className='flex flex-1 flex-col gap-4 min-h-0'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-64 rounded-full' />
          <Skeleton className='h-8 w-36 rounded-full' />
        </div>
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='rounded-xl border border-border/70 bg-card p-5 space-y-3'>
              <Skeleton className='h-1.5 w-full rounded-t-xl' />
              <Skeleton className='size-12 rounded-xl' />
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-5 w-full' />
              <div className='border-t border-border/40 pt-3 flex justify-between'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
