import type { ApiResponse } from '@/features/bots/api/types';

export type TransactionStatus = 'pending' | 'settled' | 'success' | 'failed' | 'expired';

export interface Transaction {
  id: string;
  external_id: string;
  member_name: string;
  member_username: string;
  package_name: string;
  amount: string;
  status: TransactionStatus;
  created_at: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface TransactionsMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type TransactionsListResponse = ApiResponse<Transaction[]> & { meta?: TransactionsMeta };
