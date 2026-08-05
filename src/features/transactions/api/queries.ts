import { queryOptions } from '@tanstack/react-query';
import { getTransactions } from './service';
import type { TransactionFilters } from './types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.all, 'list', filters] as const
};

export const transactionsQueryOptions = (filters: TransactionFilters) =>
  queryOptions({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters)
  });
