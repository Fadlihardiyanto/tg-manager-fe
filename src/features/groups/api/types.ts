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
  telegram_chat_id: number;
  name: string;
  description: string;
  member_count: number;
  is_active: boolean;
  inactive_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Create Group (POST /api/v1/tenant/groups) ─────────────────────

export interface CreateGroupRequest {
  bot_id: string;
  telegram_chat_id: number;
  name: string;
}

// ─── Update Group (PUT /api/v1/tenant/groups/{id}) ──────────────────

export interface UpdateGroupRequest {
  bot_id?: string;
  name?: string;
}

// ─── List Response ──────────────────────────────────────────────────

export type GroupsListResponse = ApiResponse<TelegramGroup[]>;

// ─── Single Response ────────────────────────────────────────────────

export type GroupResponse = ApiResponse<TelegramGroup>;
