import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutLoading() {
  return (
    <main className='flex min-h-screen items-center justify-center px-4 py-10'>
      <Card className='w-full max-w-2xl'>
        <CardContent className='flex flex-col items-center gap-6 p-8 sm:p-10'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <Skeleton className='h-8 w-2/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-12 w-full' />
        </CardContent>
      </Card>
    </main>
  );
}
