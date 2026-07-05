// ============================================================
// Package API Types — Contract with Backend
// ============================================================
// Based on api.yml — Tenant - Packages & Discounts endpoints
// ============================================================

import type { ApiResponse } from '@/features/bots/api/types';

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ─── Package Entity ─────────────────────────────────────────────────

export interface PackageGroup {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  client_id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  is_all_access: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  groups?: PackageGroup[];
}

// ─── Create Package (POST /api/v1/tenant/packages) ──────────────────

export interface CreatePackageRequest {
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  is_all_access?: boolean;
}

// ─── Update Package (PUT /api/v1/tenant/packages/{id}) ──────────────

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  duration_days?: number;
  is_all_access?: boolean;
}

// ─── Associate Groups (POST /api/v1/tenant/packages/{id}/groups) ─────

export interface PackageGroupAssociateRequest {
  group_ids: string[];
}

// ─── List Response ──────────────────────────────────────────────────

export type PackagesListResponse = ApiResponse<Package[]>;

// ─── Single Response ────────────────────────────────────────────────

export type PackageResponse = ApiResponse<Package>;
