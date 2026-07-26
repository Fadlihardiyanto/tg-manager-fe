'use client';

import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useQueryState } from 'nuqs';
import { MemberDetail } from './member-detail';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MemberDetailDrawer() {
  const [memberId, setMemberId] = useQueryState('memberId');

  const isOpen = !!memberId;

  const handleClose = () => {
    setMemberId(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className='w-full sm:max-w-[450px] p-0 flex flex-col gap-0 border-l shadow-2xl overflow-hidden bg-background [&>button]:hidden'>
        <SheetTitle className='sr-only'>Detail Member</SheetTitle>
        <SheetDescription className='sr-only'>
          Lihat detail informasi member termasuk langganan aktif, riwayat, dan status grup.
        </SheetDescription>
        {memberId && (
          <Suspense fallback={<MemberDetailSkeleton />}>
            <MemberDetail memberId={memberId} />
          </Suspense>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function MemberDetailSkeleton() {
  return (
    <div className='flex flex-col h-full bg-background'>
      <div className='p-6 pb-0 border-b border-border relative'>
        <div className='flex items-center gap-4 mb-6'>
          <Skeleton className='size-16 rounded-2xl' />
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>
        <div className='flex gap-6'>
          <Skeleton className='h-4 w-16 mb-3' />
          <Skeleton className='h-4 w-24 mb-3' />
          <Skeleton className='h-4 w-16 mb-3' />
        </div>
      </div>
      <div className='flex-1 p-6 flex flex-col gap-6'>
        <Skeleton className='h-4 w-32 mb-4' />
        <div className='grid grid-cols-2 gap-4'>
          <Skeleton className='h-20 w-full rounded-xl' />
          <Skeleton className='h-20 w-full rounded-xl' />
          <Skeleton className='h-20 w-full rounded-xl' />
          <Skeleton className='h-20 w-full rounded-xl' />
        </div>
        <Skeleton className='h-24 w-full rounded-xl mt-6' />
      </div>
    </div>
  );
}
