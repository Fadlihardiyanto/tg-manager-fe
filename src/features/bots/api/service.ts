// ============================================================
// Bot Service — Data Access Layer
// ============================================================
// Server Actions for Telegram Bot CRUD operations.
// Tokens are read from httpOnly cookies set during auth.
//
// Backend API reference: api.yml — Tenant - Bots
//
// GET    /api/v1/tenant/bots          — List bots
// POST   /api/v1/tenant/bots          — Create bot
// GET    /api/v1/tenant/bots/{id}     — Get bot details
// PUT    /api/v1/tenant/bots/{id}     — Update bot
// DELETE /api/v1/tenant/bots/{id}     — Delete bot
// ============================================================

'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type {
  CreateBotRequest,
  UpdateBotRequest,
  BotsListResponse,
  BotResponse,
  ApiResponse
} from './types';

// ─── List Bots ──────────────────────────────────────────────────────
export async function getBots(): Promise<BotsListResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<BotsListResponse>('/api/v1/tenant/bots', {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch bots';
    return { success: false, code: 400, message, data: [] };
  }
}

// ─── Get Bot by ID ──────────────────────────────────────────────────
export async function getBotById(id: string): Promise<BotResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<BotResponse>(`/api/v1/tenant/bots/${id}`, {
      method: 'GET',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch bot';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Create Bot ─────────────────────────────────────────────────────
export async function createBot(data: CreateBotRequest): Promise<BotResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<BotResponse>('/api/v1/tenant/bots', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create bot';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Update Bot ─────────────────────────────────────────────────────
export async function updateBot(
  id: string,
  data: UpdateBotRequest
): Promise<BotResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<BotResponse>(`/api/v1/tenant/bots/${id}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update bot';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Delete Bot ─────────────────────────────────────────────────────
export async function deleteBot(id: string): Promise<ApiResponse<null>> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<ApiResponse<null>>(`/api/v1/tenant/bots/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete bot';
    return { success: false, code: 400, message, data: null };
  }
}
