import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecentSalesSkeleton() {
  return (
    <Card className='h-full overflow-hidden border-border/70 shadow-sm'>
      <CardHeader className='border-b bg-muted/20'>
        <Skeleton className='h-5 w-[140px]' />
        <Skeleton className='mt-2 h-4 w-[180px]' />
      </CardHeader>
      <CardContent className='pt-5'>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center rounded-lg border border-transparent p-2'
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='ml-4 flex-1 space-y-2'>
                <Skeleton className='h-4 w-[120px]' />
                <Skeleton className='h-3 w-[160px]' />
              </div>
              <div className='ml-auto space-y-2 text-right'>
                <Skeleton className='ml-auto h-4 w-[80px]' />
                <Skeleton className='ml-auto h-5 w-[60px] rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
