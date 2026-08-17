'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  ReportFailuresResponse,
  ReportSettingsResponse,
  SaveReportSettingsRequest
} from './types';

export async function getReportSettings(): Promise<ReportSettingsResponse> {
  const authHeaders = await getAuthHeaders();
  try {
    return await apiClient<ReportSettingsResponse>('/api/v1/tenant/report-settings', {
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil pengaturan laporan';
    return { success: false, code: 400, message, data: null };
  }
}

export async function saveReportSettings(
  data: SaveReportSettingsRequest
): Promise<ReportSettingsResponse> {
  const authHeaders = await getAuthHeaders();
  try {
    return await apiClient<ReportSettingsResponse>('/api/v1/tenant/report-settings', {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan laporan';
    return { success: false, code: 400, message, data: null };
  }
}

export async function getReportFailures(date?: string): Promise<ReportFailuresResponse> {
  const authHeaders = await getAuthHeaders();
  const query = date ? `?date=${date}` : '';
  try {
    return await apiClient<ReportFailuresResponse>(`/api/v1/tenant/report-failures${query}`, {
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil daftar kegagalan';
    return { success: false, code: 400, message, data: [] };
  }
}
