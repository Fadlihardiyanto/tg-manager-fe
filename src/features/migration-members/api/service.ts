'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  MigrationImportPayload,
  MigrationImportResponse,
  MigrationMemberFilters,
  MigrationMembersResponse
} from './types';

export async function getMigrationMembers(
  filters: MigrationMemberFilters
): Promise<MigrationMembersResponse> {
  const authHeaders = await getAuthHeaders();
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.package_id && filters.package_id !== 'all') {
    params.append('package_id', filters.package_id);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  try {
    return await apiClient<MigrationMembersResponse>(
      `/api/v1/tenant/migration-members${queryString}`,
      {
        headers: { ...authHeaders }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch migration members';
    return {
      success: false,
      code: 500,
      message,
      data: [],
      meta: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        total: 0,
        total_pages: 0
      }
    };
  }
}

export async function importMigrationMembers(
  payload: MigrationImportPayload
): Promise<MigrationImportResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<MigrationImportResponse>('/api/v1/tenant/migration-members/import', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import migration members';
    return {
      success: false,
      code: 500,
      message,
      data: {
        total_submitted: payload.members.length,
        imported: 0,
        skipped: payload.members.length,
        errors: []
      }
    };
  }
}
