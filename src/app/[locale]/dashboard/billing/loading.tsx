import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <Card>
      <CardContent className='p-6 space-y-6'>
        <Skeleton className='h-7 w-48' />
        <div className='grid grid-cols-2 gap-4'>
          <Skeleton className='h-24 w-full rounded-xl' />
          <Skeleton className='h-24 w-full rounded-xl' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>
      </CardContent>
    </Card>
  );
}
