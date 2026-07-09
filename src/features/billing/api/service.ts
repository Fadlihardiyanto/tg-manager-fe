'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  ActiveBillingResponse,
  BillingHistoryFilters,
  BillingHistoryResponse,
  CheckoutBillingRequest,
  CheckoutBillingResponse,
  PublicPlansResponse
} from './types';

type LegacyPublicPlansResponse = {
  meta?: {
    success?: boolean;
    message?: string;
  };
  data?: unknown;
};

function normalizePublicPlansResponse(raw: unknown): PublicPlansResponse {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'success' in raw &&
    'data' in raw &&
    Array.isArray((raw as { data: unknown }).data)
  ) {
    return raw as PublicPlansResponse;
  }

  const legacy = raw as LegacyPublicPlansResponse;
  const data = Array.isArray(legacy?.data) ? legacy.data : [];

  return {
    success: legacy?.meta?.success ?? true,
    code: 200,
    message: legacy?.meta?.message ?? '',
    data: data as PublicPlansResponse['data']
  };
}

export async function getActiveBilling(): Promise<ActiveBillingResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ActiveBillingResponse>('/api/v1/tenant/billing/active', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil penagihan aktif';
    return { success: false, code: 400, message, data: undefined as never };
  }
}

export async function getPublicPlans(): Promise<PublicPlansResponse> {
  try {
    const response = await apiClient<unknown>('/api/v1/public/plans', {
      method: 'GET'
    });

    return normalizePublicPlansResponse(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil paket publik';
    return { success: false, code: 400, message, data: [] };
  }
}

export async function checkoutBillingPlan(
  payload: CheckoutBillingRequest
): Promise<CheckoutBillingResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<CheckoutBillingResponse>('/api/v1/tenant/billing/checkout', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memproses checkout paket';
    return {
      success: false,
      code: 400,
      message,
      data: { payment_url: '' }
    };
  }
}

export async function getBillingHistory(
  filters: BillingHistoryFilters = {}
): Promise<BillingHistoryResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();

  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();

  try {
    return await apiClient<BillingHistoryResponse>(
      `/api/v1/tenant/billing/history${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: { ...authHeaders }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil riwayat penagihan';
    return {
      success: false,
      code: 400,
      message,
      data: [],
      meta: { page: filters.page ?? 1, limit: filters.limit ?? 10, total: 0, total_pages: 0 }
    };
  }
}
