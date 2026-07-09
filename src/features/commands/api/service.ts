'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  CreateCommandRequest,
  UpdateCommandRequest,
  CommandsListResponse,
  CommandResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  ApiResponse
} from './types';

export async function getPresignedUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<PresignedUrlResponse>('/api/v1/tenant/upload/presign', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mendapatkan URL pra-tanda tangan';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function getCommands(): Promise<CommandsListResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<CommandsListResponse>('/api/v1/tenant/commands?limit=1000', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil perintah';
    return { success: false, code: 400, message, data: [] };
  }
}

export async function createCommand(data: CreateCommandRequest): Promise<CommandResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<CommandResponse>('/api/v1/tenant/commands', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat perintah';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function updateCommand(
  id: string,
  data: UpdateCommandRequest
): Promise<CommandResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<CommandResponse>(`/api/v1/tenant/commands/${id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui perintah';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function deleteCommand(id: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/commands/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus perintah';
    return { success: false, code: 400, message, data: null };
  }
}
