// ============================================================
// Discount API Types — Contract with Backend
// ============================================================
// Based on api.yml — Tenant - Packages & Discounts endpoints
// ============================================================

import type { ApiResponse } from '@/features/bots/api/types';

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ─── Discount Entity ────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed';

export interface MemberDiscount {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  max_discount: number;
  min_purchase: number;
  max_usage: number;
  used_count: number;
  max_usage_per_user: number;
  applicable_package_ids: string[];
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// ─── Create Discount (POST /api/v1/tenant/discounts) ────────────────

export interface CreateMemberDiscountRequest {
  name: string;
  code?: string;
  type: DiscountType;
  value: number;
  max_discount?: number;
  min_purchase?: number;
  max_usage?: number;
  max_usage_per_user?: number;
  applicable_package_ids?: string[];
  valid_from?: string;
  valid_until?: string;
}

// ─── Update Discount (PUT /api/v1/tenant/discounts/{id}) ────────────

export interface UpdateMemberDiscountRequest {
  name?: string;
  value?: number;
  max_discount?: number;
  min_purchase?: number;
  max_usage?: number;
  max_usage_per_user?: number;
  valid_until?: string;
  is_active?: boolean;
}

// ─── List Response ──────────────────────────────────────────────────

export type DiscountsListResponse = ApiResponse<MemberDiscount[]>;

// ─── Single Response ────────────────────────────────────────────────

export type DiscountResponse = ApiResponse<MemberDiscount>;
