import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BarGraphSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-[160px]' />
          <Skeleton className='h-5 w-[60px] rounded-full' />
        </div>
        <Skeleton className='h-4 w-[150px]' />
      </CardHeader>
      <CardContent>
        <div className='flex aspect-auto h-[280px] w-full items-end justify-around gap-2 pt-8'>
          {[40, 65, 35, 80, 50, 70, 45, 90, 55, 60, 30, 75].map((h, i) => (
            <Skeleton key={i} className='w-full rounded-t-sm' style={{ height: `${h}%` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
