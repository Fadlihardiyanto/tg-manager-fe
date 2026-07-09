// ============================================================
// Discount Service — Data Access Layer
// ============================================================
// Server Actions for Member Discount CRUD operations.
// Tokens are read from httpOnly cookies set during auth.
//
// Backend API reference: api.yml — Tenant - Packages & Discounts
//
// GET    /api/v1/tenant/discounts       — List discounts
// POST   /api/v1/tenant/discounts       — Create discount
// PUT    /api/v1/tenant/discounts/{id}  — Update discount
// DELETE /api/v1/tenant/discounts/{id}  — Delete discount
// ============================================================

'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  CreateMemberDiscountRequest,
  UpdateMemberDiscountRequest,
  DiscountsListResponse,
  DiscountResponse,
  ApiResponse
} from './types';

// ─── List Discounts ─────────────────────────────────────────────────
export async function getDiscounts(): Promise<DiscountsListResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<DiscountsListResponse>('/api/v1/tenant/discounts', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil diskon';
    return { success: false, code: 400, message, data: [] };
  }
}

// ─── Create Discount ────────────────────────────────────────────────
export async function createDiscount(data: CreateMemberDiscountRequest): Promise<DiscountResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<DiscountResponse>('/api/v1/tenant/discounts', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat diskon';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Update Discount ────────────────────────────────────────────────
export async function updateDiscount(
  id: string,
  data: UpdateMemberDiscountRequest
): Promise<DiscountResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<DiscountResponse>(`/api/v1/tenant/discounts/${id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui diskon';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Delete Discount ────────────────────────────────────────────────
export async function deleteDiscount(id: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/discounts/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus diskon';
    return { success: false, code: 400, message, data: null };
  }
}
