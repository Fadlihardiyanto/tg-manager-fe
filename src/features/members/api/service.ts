'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  MembersResponse,
  MemberDetailResponse,
  MemberDetail,
  MemberFilters,
  ActionResponse,
  ExtendAccessPayload
} from './types';

interface BulkKickTarget {
  id: string;
  subscriptionId?: string;
}

interface BulkExtendTarget {
  id: string;
  subscriptionId: string;
  additionalDays: number;
}

export async function getMembers(filters: MemberFilters): Promise<MembersResponse> {
  const authHeaders = await getAuthHeaders();

  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.package_id) params.append('package_id', filters.package_id);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  return apiClient<MembersResponse>(`/api/v1/tenant/members${queryString}`, {
    headers: { ...authHeaders }
  });
}

export async function getMember(id: string): Promise<MemberDetailResponse> {
  const authHeaders = await getAuthHeaders();

  return apiClient<MemberDetailResponse>(`/api/v1/tenant/members/${id}`, {
    headers: { ...authHeaders }
  });
}

export async function extendAccess(
  id: string,
  payload: ExtendAccessPayload
): Promise<ActionResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ActionResponse>(`/api/v1/tenant/members/${id}/extend`, {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperpanjang akses';
    return { success: false, message };
  }
}

export async function kickMember(id: string, subscriptionId?: string): Promise<ActionResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();

  if (subscriptionId) {
    params.append('subscription_id', subscriptionId);
  }

  try {
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient<ActionResponse>(`/api/v1/tenant/members/${id}/kick${queryString}`, {
      method: 'POST',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengeluarkan member';
    return { success: false, message };
  }
}

export async function manualSync(id: string): Promise<ActionResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ActionResponse>(`/api/v1/tenant/members/${id}/sync`, {
      method: 'POST',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyinkronkan member';
    return { success: false, message };
  }
}

export async function resendLink(id: string, subscriptionId?: string): Promise<ActionResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();

  if (subscriptionId) {
    params.append('subscription_id', subscriptionId);
  }

  try {
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return await apiClient<ActionResponse>(
      `/api/v1/tenant/members/${id}/resend-link${queryString}`,
      {
        method: 'POST',
        headers: { ...authHeaders }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengirim ulang tautan';
    return { success: false, message };
  }
}

export async function bulkKickMembers(targets: BulkKickTarget[]): Promise<ActionResponse> {
  try {
    const results = await Promise.all(
      targets.map((target) => kickMember(target.id, target.subscriptionId))
    );
    const allSucceeded = results.every((r) => r.success);

    return {
      success: allSucceeded,
      message: allSucceeded
        ? `${targets.length} members kicked successfully`
        : 'Gagal mengeluarkan sebagian member'
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengeluarkan member';
    return { success: false, message };
  }
}

export async function bulkExtendMembers(targets: BulkExtendTarget[]): Promise<ActionResponse> {
  try {
    const results = await Promise.all(
      targets.map((t) =>
        extendAccess(t.id, { subscription_id: t.subscriptionId, additional_days: t.additionalDays })
      )
    );
    const allSucceeded = results.every((r) => r.success);

    return {
      success: allSucceeded,
      message: allSucceeded
        ? `${targets.length} langganan berhasil diperpanjang`
        : 'Gagal memperpanjang sebagian langganan'
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperpanjang langganan';
    return { success: false, message };
  }
}
