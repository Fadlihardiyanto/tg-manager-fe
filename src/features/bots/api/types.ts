// ============================================================
// Bot API Types — Contract with Backend
// ============================================================
// Based on api.yml — Tenant - Bots endpoints
// ============================================================

// ─── Generic API Response Wrapper ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  request_id?: string;
}

// ─── Bot Entity ─────────────────────────────────────────────────────

export type BotRole = 'sales_only' | 'gatekeeper_only' | 'all_in_one';

export interface TelegramBot {
  id: string;
  client_id: string;
  telegram_bot_id: number;
  username: string;
  bot_role: BotRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Create Bot (POST /api/v1/tenant/bots) ──────────────────────────

export interface CreateBotRequest {
  token: string;
  bot_role?: BotRole;
}

// ─── Update Bot (PUT /api/v1/tenant/bots/{id}) ──────────────────────

export interface UpdateBotRequest {
  bot_role?: BotRole;
  is_active?: boolean;
}

// ─── List Response ──────────────────────────────────────────────────

export type BotsListResponse = ApiResponse<TelegramBot[]>;

// ─── Single Response ────────────────────────────────────────────────

export type BotResponse = ApiResponse<TelegramBot>;
