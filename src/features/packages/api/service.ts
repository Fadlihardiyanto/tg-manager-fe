// ============================================================
// Package Service — Data Access Layer
// ============================================================
// Server Actions for Package CRUD + Group Association.
// Tokens are read from httpOnly cookies set during auth.
//
// Backend API reference: api.yml — Tenant - Packages & Discounts
//
// GET    /api/v1/tenant/packages              — List packages
// POST   /api/v1/tenant/packages              — Create package
// GET    /api/v1/tenant/packages/{id}         — Get package details
// PUT    /api/v1/tenant/packages/{id}         — Update package
// DELETE /api/v1/tenant/packages/{id}         — Delete package
// POST   /api/v1/tenant/packages/{id}/groups  — Associate groups
// ============================================================

'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageGroupAssociateRequest,
  PackagesListResponse,
  PackageResponse,
  ApiResponse
} from './types';

// ─── List Packages ──────────────────────────────────────────────────
export async function getPackages(): Promise<PackagesListResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<PackagesListResponse>('/api/v1/tenant/packages', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch packages';
    return { success: false, code: 400, message, data: [] };
  }
}

// ─── Get Package by ID ──────────────────────────────────────────────
export async function getPackageById(id: string): Promise<PackageResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<PackageResponse>(`/api/v1/tenant/packages/${id}`, {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch package';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Create Package ─────────────────────────────────────────────────
export async function createPackage(
  data: CreatePackageRequest
): Promise<PackageResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<PackageResponse>('/api/v1/tenant/packages', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create package';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Update Package ─────────────────────────────────────────────────
export async function updatePackage(
  id: string,
  data: UpdatePackageRequest
): Promise<PackageResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<PackageResponse>(`/api/v1/tenant/packages/${id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update package';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Delete Package ─────────────────────────────────────────────────
export async function deletePackage(id: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/packages/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete package';
    return { success: false, code: 400, message, data: null };
  }
}

// ─── Associate Groups to Package ────────────────────────────────────
export async function associateGroupsToPackage(
  packageId: string,
  data: PackageGroupAssociateRequest
): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(
      `/api/v1/tenant/packages/${packageId}/groups`,
      {
        method: 'POST',
        headers: { ...authHeaders },
        body: JSON.stringify(data)
      }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to associate groups';
    return { success: false, code: 400, message, data: null };
  }
}
