// ============================================================
// Group Service — Data Access Layer
// ============================================================
// Server Actions for Telegram Group operations.
// Tokens are read from httpOnly cookies set during auth.
//
// Backend API reference: api.yml — Tenant - Groups
//
// GET    /api/v1/tenant/groups                               — List groups
// GET    /api/v1/tenant/groups/{id}                           — Get group details
// PUT    /api/v1/tenant/groups/{id}                           — Update group
// DELETE /api/v1/tenant/groups/{id}                           — Delete group
// POST   /api/v1/tenant/bots/{bot_id}/groups/connect-token    — Generate connect token
// ============================================================

'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  UpdateGroupRequest,
  GroupsListResponse,
  GroupResponse,
  ConnectTokenResponse,
  BulkDeleteResponse,
  ApiResponse
} from './types';

// ─── List Groups ────────────────────────────────────────────────────
export async function getGroups(): Promise<GroupsListResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<GroupsListResponse>('/api/v1/tenant/groups', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil grup';
    return { success: false, code: 400, message, data: [] };
  }
}

// ─── Get Group by ID ────────────────────────────────────────────────
export async function getGroupById(id: string): Promise<GroupResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<GroupResponse>(`/api/v1/tenant/groups/${id}`, {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil grup';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Update Group ───────────────────────────────────────────────────
export async function updateGroup(id: string, data: UpdateGroupRequest): Promise<GroupResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<GroupResponse>(`/api/v1/tenant/groups/${id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui grup';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Delete Group ───────────────────────────────────────────────────
export async function deleteGroup(id: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/groups/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus grup';
    return { success: false, code: 400, message, data: null };
  }
}

// ─── Bulk Delete Groups (DELETE /api/v1/tenant/groups/bulk) ────────
export async function bulkDeleteGroups(ids: string[]): Promise<BulkDeleteResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<BulkDeleteResponse>('/api/v1/tenant/groups/bulk', {
      method: 'DELETE',
      headers: { ...authHeaders },
      body: JSON.stringify({ ids })
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus grup';
    return { success: false, code: 400, message, data: { deleted: 0, failed: null } };
  }
}

// ─── Generate Connect Token ────────────────────────────────────────
export async function syncGroups(): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>('/api/v1/tenant/groups/sync', {
      method: 'POST',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sync groups';
    return { success: false, code: 400, message, data: null };
  }
}

export async function generateConnectToken(botId: string): Promise<ConnectTokenResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ConnectTokenResponse>(
      `/api/v1/tenant/bots/${botId}/groups/connect-token`,
      {
        method: 'POST',
        headers: { ...authHeaders }
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat token';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Disconnect Group from Bot ──────────────────────────────────────
export async function disconnectGroup(groupId: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/groups/${groupId}/disconnect`, {
      method: 'POST',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memutuskan grup';
    return { success: false, code: 400, message, data: null };
  }
}
