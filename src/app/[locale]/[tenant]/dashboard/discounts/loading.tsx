import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pt-2 pb-3 md:px-4 md:pt-3 md:pb-4'>
      <div className='mb-4'>
        <Skeleton className='h-[28px] w-28 rounded-sm' />
      </div>
      <div className='flex flex-1 flex-col gap-4 min-h-0'>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-32 rounded-full' />
        </div>
        <DataTableSkeleton columnCount={7} filterCount={1} withPagination />
      </div>
    </div>
  );
}
