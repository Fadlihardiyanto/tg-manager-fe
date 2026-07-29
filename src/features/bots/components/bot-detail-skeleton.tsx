import { Skeleton } from '@/components/ui/skeleton';

export function BotDetailSkeleton() {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 animate-pulse'>
      {/* Header */}
      <div className='rounded-xl border border-border/70 bg-card p-5'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-14 rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-3 w-20' />
            <div className='flex gap-2'>
              <Skeleton className='h-5 w-16 rounded-full' />
              <Skeleton className='h-5 w-20 rounded-full' />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-xl border border-border/70 px-4 py-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3 w-14' />
              <Skeleton className='size-4' />
            </div>
            <Skeleton className='mt-1 h-6 w-8' />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <Skeleton className='h-9 w-24 rounded-md' />
        <Skeleton className='h-9 w-32 rounded-md' />
        <Skeleton className='h-9 w-28 rounded-md' />
      </div>

      {/* Group list */}
      <div className='rounded-xl border border-border/70 p-6'>
        <div className='flex flex-col items-center gap-6'>
          <div className='flex flex-wrap justify-center gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3'
              >
                <Skeleton className='size-10 rounded-lg' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-3 w-14' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
