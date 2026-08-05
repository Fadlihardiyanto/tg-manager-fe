import type {
  CreateBroadcastRequest,
  BroadcastsListResponse,
  BroadcastResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  BroadcastReachResponse
} from './types';

const LOGIN_URL = '/login';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include'
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = LOGIN_URL;
    throw new Error('Sesi habis');
  }
  return res.json();
}

export async function getPresignedUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  try {
    return await apiFetch('/api/tenant/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mendapatkan link upload';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function getBroadcasts(
  botId: string,
  filters: { page?: number; limit?: number }
): Promise<BroadcastsListResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  try {
    return await apiFetch(`/api/tenant/bots/${botId}/broadcasts${qs ? '?' + qs : ''}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil riwayat broadcast';
    return { success: false, code: 400, message, data: [] };
  }
}

export async function createBroadcast(
  botId: string,
  data: CreateBroadcastRequest
): Promise<BroadcastResponse> {
  try {
    return await apiFetch(`/api/tenant/bots/${botId}/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat broadcast';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function getBroadcastReach(botId: string): Promise<BroadcastReachResponse> {
  try {
    return await apiFetch(`/api/tenant/bots/${botId}/broadcast-reach`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil data jangkauan';
    return { success: false, code: 400, message, data: undefined as any };
  }
}
