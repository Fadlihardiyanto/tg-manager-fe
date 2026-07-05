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

export async function getMembers(filters: MemberFilters): Promise<MembersResponse> {
  const authHeaders = await getAuthHeaders();

  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.package_id) params.append('package_id', filters.package_id);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  try {
    return await apiClient<MembersResponse>(`/api/v1/tenant/members${queryString}`, {
      headers: { ...authHeaders }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    return {
      success: false,
      code: 500, // ponytail: static, not used by UI
      message,
      meta: { page: 1, limit: 10, total: 0, total_pages: 0 },
      data: []
    };
  }
}

export async function getMember(id: string): Promise<MemberDetailResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<MemberDetailResponse>(`/api/v1/tenant/members/${id}`, {
      headers: { ...authHeaders }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    return {
      success: false,
      message,
      data: {} as MemberDetail
    };
  }
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
    const message = err instanceof Error ? err.message : 'Failed to extend access';
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
    const message = err instanceof Error ? err.message : 'Failed to kick member';
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
    const message = err instanceof Error ? err.message : 'Failed to sync member';
    return { success: false, message };
  }
}

export async function resendLink(id: string): Promise<ActionResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ActionResponse>(`/api/v1/tenant/members/${id}/resend-link`, {
      method: 'POST',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resend link';
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
        : 'Failed to kick some members'
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to kick members';
    return { success: false, message };
  }
}
