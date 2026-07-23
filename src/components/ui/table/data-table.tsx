import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getCommonPinningStyles } from '@/lib/data-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  notice?: React.ReactNode;
  title?: string;
  description?: string;
}

export function DataTable<TData>({
  table,
  actionBar,
  notice,
  children,
  title,
  description
}: DataTableProps<TData>) {
  const hasTitle = title || description;

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm'>
      {notice && <div className='shrink-0 px-4 pt-4'>{notice}</div>}

      {hasTitle && (
        <div className='shrink-0 px-4 pt-3 pb-4'>
          {title && <h2 className='text-lg font-bold text-foreground'>{title}</h2>}
          {description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
        </div>
      )}

      {children && (
        <div className='z-40 shrink-0 border-y border-border/70 bg-background/95 p-4 backdrop-blur'>
          {children}
        </div>
      )}

      <div className='relative min-h-0 flex-1'>
        <ScrollArea className='h-full w-full'>
          <Table>
            <TableHeader className='sticky top-0 z-20 bg-muted/30'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className='hover:bg-transparent border-b border-border/50'
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className='h-11 px-5 text-xs font-semibold tracking-normal text-muted-foreground'
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                        background: header.column.getIsPinned()
                          ? 'color-mix(in oklab, var(--background) 96%, var(--muted))'
                          : undefined,
                        zIndex: header.column.getIsPinned() ? 30 : 20,
                        width: header.column.getSize() !== 150 ? header.column.getSize() : undefined
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className='h-14 px-5'
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                          background: cell.column.getIsPinned() ? 'var(--background)' : undefined,
                          width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className='text-muted-foreground h-32 text-center'
                  >
                    Tidak ada hasil.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>

      <div className='z-30 flex shrink-0 flex-col gap-2 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur'>
        <DataTablePagination table={table} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  );
}
