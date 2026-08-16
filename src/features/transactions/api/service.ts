'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type { TransactionFilters, TransactionsListResponse } from './types';

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionsListResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();

  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const query = params.toString();

  try {
    return await apiClient<TransactionsListResponse>(
      `/api/v1/tenant/transactions${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: { ...authHeaders }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil transaksi';
    return {
      success: false,
      code: 400,
      message,
      data: [],
      meta: { page: filters.page ?? 1, limit: filters.limit ?? 10, total: 0, total_pages: 0 }
    };
  }
}
