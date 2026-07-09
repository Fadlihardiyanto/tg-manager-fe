import { apiClient } from '@/lib/api-client';
import type { PublicCheckoutResponse } from './types';

export async function getPublicCheckout(orderId: string): Promise<PublicCheckoutResponse> {
  try {
    return await apiClient<PublicCheckoutResponse>(
      `/api/v1/public/checkout/${encodeURIComponent(orderId)}`,
      {
        method: 'GET'
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil detail checkout';
    return { success: false, code: 400, message, data: undefined as never };
  }
}
