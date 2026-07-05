'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type { ActiveBillingResponse } from './types';

export async function getActiveBilling(): Promise<ActiveBillingResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ActiveBillingResponse>('/api/v1/tenant/billing/active', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch active billing';
    return { success: false, code: 400, message, data: undefined as never };
  }
}
