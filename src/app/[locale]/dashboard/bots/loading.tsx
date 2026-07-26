import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {/* Stats skeleton: 4 cards */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-border/70 bg-card p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='size-8 rounded-lg' />
            </div>
            <Skeleton className='mt-3 h-7 w-12' />
            <Skeleton className='mt-1.5 h-3 w-16' />
          </div>
        ))}
      </div>

      {/* Quota + button skeleton */}
      <div className='flex items-center justify-between gap-3'>
        <Skeleton className='h-12 flex-1 rounded-2xl' />
        <Skeleton className='h-9 w-28 rounded-full' />
      </div>

      {/* Card grid skeleton: 3 cards */}
      <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-border/70 bg-card shadow-sm'>
            {/* Stripe */}
            <Skeleton className='h-1 w-full rounded-t-xl' />
            <div className='flex flex-col p-5'>
              {/* Avatar + name */}
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='size-12 rounded-xl' />
                  <div>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='mt-1.5 h-3 w-16' />
                  </div>
                </div>
                <Skeleton className='size-8 rounded-md' />
              </div>
              {/* Badges */}
              <div className='mt-4 flex items-center gap-2'>
                <Skeleton className='h-6 w-16 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
              {/* Group count */}
              <div className='mt-3 flex items-center gap-2'>
                <Skeleton className='size-4 rounded' />
                <Skeleton className='h-4 w-28' />
              </div>
              {/* Footer */}
              <div className='mt-4 flex items-center justify-between border-t border-border/70 pt-3'>
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-3 w-14' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
