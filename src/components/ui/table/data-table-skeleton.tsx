import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableSkeletonProps extends React.ComponentProps<'div'> {
  columnCount: number;
  rowCount?: number;
  filterCount?: number;
  cellWidths?: string[];
  withViewOptions?: boolean;
  withPagination?: boolean;
  shrinkZero?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  filterCount = 0,
  cellWidths = ['auto'],
  withViewOptions = true,
  withPagination = true,
  shrinkZero = false,
  className,
  ...props
}: DataTableSkeletonProps) {
  const cozyCellWidths = Array.from(
    { length: columnCount },
    (_, index) => cellWidths[index % cellWidths.length] ?? 'auto'
  );

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col rounded-lg border border-border/70 bg-background shadow-sm',
        className
      )}
      {...props}
    >
      <div className='sticky top-16 z-40 flex w-full shrink-0 items-center justify-between gap-2 overflow-auto border-b border-border/70 bg-background/95 p-2 backdrop-blur md:top-14'>
        <div className='flex flex-1 items-center gap-2'>
          {filterCount > 0
            ? Array.from({ length: filterCount }).map((_, i) => (
                <Skeleton key={i} className='h-7 w-[4.5rem] rounded-full border-dashed' />
              ))
            : null}
        </div>
        {withViewOptions ? (
          <Skeleton className='ml-auto hidden h-7 w-[4.5rem] rounded-full lg:flex' />
        ) : null}
      </div>

      <div className='min-h-0 flex-1 overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {Array.from({ length: 1 }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableHead
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : 'auto'
                    }}
                  >
                    <Skeleton className='h-6 w-full' />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className='hover:bg-transparent'>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell
                    key={j}
                    style={{
                      width: cozyCellWidths[j],
                      minWidth: shrinkZero ? cozyCellWidths[j] : 'auto'
                    }}
                  >
                    <Skeleton className='h-6 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {withPagination ? (
        <div className='sticky bottom-0 z-30 flex w-full shrink-0 items-center justify-between gap-4 overflow-auto border-t border-border/70 bg-background/95 px-2 py-1.5 backdrop-blur sm:gap-8'>
          <Skeleton className='h-7 w-40 shrink-0' />
          <div className='flex items-center gap-4 sm:gap-6 lg:gap-8'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-7 w-24' />
              <Skeleton className='h-7 w-[4.5rem]' />
            </div>
            <div className='flex items-center justify-center text-sm font-medium'>
              <Skeleton className='h-7 w-20' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='hidden size-7 lg:block' />
              <Skeleton className='size-7' />
              <Skeleton className='size-7' />
              <Skeleton className='hidden size-7 lg:block' />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
