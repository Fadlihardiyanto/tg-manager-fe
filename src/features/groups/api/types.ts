// ============================================================
// Group API Types — Contract with Backend
// ============================================================
// Based on api.yml — Tenant - Groups endpoints
// ============================================================

import type { ApiResponse } from '@/features/bots/api/types';

// Re-export ApiResponse for convenience
export type { ApiResponse };

// ─── Group Entity ───────────────────────────────────────────────────

export interface TelegramGroup {
  id: string;
  client_id: string;
  bot_id: string;
  bot_username?: string;
  bot_role?: string;
  telegram_chat_id: number;
  name: string;
  description: string;
  member_count: number;
  is_active: boolean;
  inactive_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Update Group (PUT /api/v1/tenant/groups/{id}) ──────────────────

export interface UpdateGroupRequest {
  bot_id?: string;
  name?: string;
}

// ─── Connect Token (POST /api/v1/tenant/bots/{bot_id}/groups/connect-token) ───

export interface ConnectTokenData {
  token: string;
  expires_in: number;
  bot_username: string;
}

export type ConnectTokenResponse = ApiResponse<ConnectTokenData>;

// ─── Connect Status (GET /api/v1/tenant/bots/{bot_id}/groups/connect-status/{token}) ───

export type ConnectStatus = 'pending' | 'success' | 'expired';

export interface ConnectStatusData {
  status: ConnectStatus;
}

export type ConnectStatusResponse = ApiResponse<ConnectStatusData>;

// ─── List Response ──────────────────────────────────────────────────

export type GroupsListResponse = ApiResponse<TelegramGroup[]>;

// ─── Single Response ────────────────────────────────────────────────

export type GroupResponse = ApiResponse<TelegramGroup>;

// ─── Bulk Delete (DELETE /api/v1/tenant/groups/bulk) ────────────────

export interface BulkDeleteFailedItem {
  id: string;
  error: string;
}

export interface BulkDeleteData {
  deleted: number;
  failed: BulkDeleteFailedItem[] | null;
}

export type BulkDeleteResponse = ApiResponse<BulkDeleteData>;
