import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AreaGraphSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-[140px]' />
          <Skeleton className='h-5 w-[60px] rounded-full' />
        </div>
        <Skeleton className='h-4 w-[250px]' />
      </CardHeader>
      <CardContent>
        <div className='relative aspect-auto h-[280px] w-full overflow-hidden rounded-lg'>
          {/* Animated gradient background */}
          <div className='from-primary/5 via-primary/10 to-primary/5 absolute inset-0 animate-pulse bg-linear-to-r' />

          {/* Chart area indicators */}
          <Skeleton className='absolute right-0 bottom-0 left-0 h-[1px]' />
          <Skeleton className='absolute top-0 bottom-0 left-0 w-[1px]' />

          {/* Simulated chart lines */}
          <div className='absolute inset-0 flex items-end justify-around px-4 pb-8'>
            {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 45, 65].map((height, i) => (
              <div
                key={i}
                className='w-2 rounded-t-full bg-gradient-to-t from-primary/20 to-primary/5'
                style={{
                  height: `${height}%`,
                  animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
