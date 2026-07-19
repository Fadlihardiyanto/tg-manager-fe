import React from 'react';
import { Heading } from '../ui/heading';
import type { InfobarContent } from '@/components/ui/infobar';

function PageSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-3 p-3 md:px-4'>
      <div className='flex items-center justify-between gap-3 border-b border-border/70 pb-3'>
        <div className='min-w-0 flex-1'>
          <div className='bg-muted mb-2 h-3 w-24 rounded-full' />
          <div className='bg-muted mb-1.5 h-6 w-52 rounded' />
          <div className='bg-muted h-3 w-80 max-w-full rounded' />
        </div>
        <div className='bg-muted h-8 w-24 rounded-full' />
      </div>
      <div className='bg-muted h-40 w-full rounded-xl' />
      <div className='bg-muted h-40 w-full rounded-xl' />
    </div>
  );
}

export default function PageContainer({
  children,
  isLoading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  infoContent,
  pageHeaderAction
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  infoContent?: InfobarContent;
  pageHeaderAction?: React.ReactNode;
}) {
  if (!access) {
    return (
      <div className='flex flex-1 items-center justify-center p-3 md:px-4'>
        {accessFallback ?? (
          <div className='text-muted-foreground text-center text-lg'>
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isLoading ? <PageSkeleton /> : children;

  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 pt-2 pb-3 md:px-4 md:pt-3 md:pb-4'>
      {hasHeader && (
        <div className='mb-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0'>
              <Heading
                title={pageTitle ?? ''}
                description={pageDescription ?? ''}
                infoContent={infoContent}
              />
            </div>
            {pageHeaderAction && (
              <div className='flex shrink-0 items-center'>{pageHeaderAction}</div>
            )}
          </div>
        </div>
      )}
      {content}
    </div>
  );
}
