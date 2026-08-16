'use client';

import { Suspense } from 'react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { TransactionsTable } from './transactions-table';

export function TransactionsListingContent() {
  const [status, setStatus] = useQueryState('status', parseAsString);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const handleStatusChange = (v: string | null) => {
    void setStatus(v);
    if (page !== 1) void setPage(1);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <Suspense>
        <TransactionsTable status={status} onStatusChange={handleStatusChange} />
      </Suspense>
    </div>
  );
}
