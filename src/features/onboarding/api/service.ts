// ============================================================
// Onboarding Service — Data Access Layer
// ============================================================
// Server Actions for the 3-step onboarding wizard.
// Tokens are read from httpOnly cookies set during auth.
//
// Backend guide reference: be_guide_for_fe.md
//
// Step 1 (first time):  POST /api/v1/clients/onboarding
// Step 1 (back edit):   PUT  /api/v1/tenant/settings/profile
// Step 2 (new bot):     POST /api/v1/tenant/bots
// Step 2 (update bot):  PUT  /api/v1/tenant/bots/{id}
// Step 3 (payment):     PUT  /api/v1/tenant/settings/payment
// ============================================================

'use server';

import { apiClient } from '@/lib/api-client';
import { cookies } from 'next/headers';
import type {
  CreateOnboardingRequest,
  CreateOnboardingResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  CreateBotRequest,
  CreateBotResponse,
  UpdateBotRequest,
  UpdateBotResponse,
  UpdatePaymentRequest,
  UpdatePaymentResponse
} from './types';

/**
 * Read the access_token from httpOnly cookie.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Persist new JWT pair to httpOnly cookies after backend returns
 * a refreshed token (e.g. after Step 1 onboarding creates a new tenant-scoped JWT).
 */
async function persistTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: expiresIn,
    path: '/'
  });
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  });
}

// ─── Step 1: Create Onboarding ───────────────────────────────────────
// Called the FIRST time user submits Step 1.
// Returns a new JWT containing the Client ID and Owner role.
export async function createOnboarding(data: CreateOnboardingRequest): Promise<CreateOnboardingResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    const res = await apiClient<CreateOnboardingResponse>(
      '/api/v1/clients/onboarding',
      {
        method: 'POST',
        headers: { ...authHeaders },
        body: JSON.stringify(data)
      }
    );

    // IMPORTANT: Replace old token with the new tenant-scoped JWT
    if (res.success && res.data?.access_token) {
      await persistTokens(
        res.data.access_token,
        res.data.refresh_token,
        res.data.expires_in
      );
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create workspace';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Step 1 (Back): Update Profile ──────────────────────────────────
// Called when user navigates BACK from Step 2 and edits Step 1.
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<UpdateProfileResponse>(
      '/api/v1/tenant/settings/profile',
      {
        method: 'PUT',
        headers: { ...authHeaders },
        body: JSON.stringify(data)
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    return { success: false, code: 400, message };
  }
}

// ─── Step 2: Create Bot ─────────────────────────────────────────────
// Called when user submits Step 2 for the first time (no createdBotId yet).
export async function createBot(data: CreateBotRequest): Promise<CreateBotResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<CreateBotResponse>('/api/v1/tenant/bots', {
      method: 'POST',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create bot';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Step 2 (Back): Update Bot ──────────────────────────────────────
// Called when user already has a createdBotId and edits the bot token.
export async function updateBot(botId: string, data: UpdateBotRequest): Promise<UpdateBotResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<UpdateBotResponse>(`/api/v1/tenant/bots/${botId}`, {
      method: 'PUT',
      headers: { ...authHeaders },
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update bot';
    return { success: false, code: 400, message };
  }
}

// ─── Step 3: Update Payment Settings ────────────────────────────────
// Called when user submits Step 3 (Finish).
export async function updatePaymentSettings(data: UpdatePaymentRequest): Promise<UpdatePaymentResponse> {
  const authHeaders = await getAuthHeaders();

  try {
    return await apiClient<UpdatePaymentResponse>(
      '/api/v1/tenant/settings/payment',
      {
        method: 'PUT',
        headers: { ...authHeaders },
        body: JSON.stringify(data)
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update payment settings';
    return { success: false, code: 400, message };
  }
}
