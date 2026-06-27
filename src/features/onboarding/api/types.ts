// ============================================================
// Onboarding API Types — Contract with Backend
// ============================================================
// Based on BE guide: be_guide_for_fe.md
// ============================================================

// ─── Step 1: Create Onboarding (POST /api/v1/clients/onboarding) ─────

export interface CreateOnboardingRequest {
  business_name: string;
  business_slug: string;
  category: string;
}

export interface CreateOnboardingResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    client: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
  };
}

// ─── Step 1 (Back): Update Profile (PUT /api/v1/tenant/settings/profile) ─────

export interface UpdateProfileRequest {
  name: string;
  slug: string;
  category: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  code: number;
  message: string;
}

// ─── Step 2: Create Bot (POST /api/v1/tenant/bots) ───────────────────

export interface CreateBotRequest {
  token: string;
  bot_role: string;
}

export interface CreateBotResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    id: string;
    username?: string;
    bot_username?: string;
    bot_name?: string;
  };
}

// ─── Step 2 (Back): Update Bot (PUT /api/v1/tenant/bots/{id}) ────────

export interface UpdateBotRequest {
  token: string;
}

export interface UpdateBotResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    id?: string;
    username?: string;
    bot_username?: string;
    bot_name?: string;
  };
}

// ─── Step 3: Update Payment Settings (PUT /api/v1/tenant/settings/payment) ──

export interface UpdatePaymentRequest {
  is_sandbox: boolean;
  sandbox_server_key: string;
  sandbox_client_key: string;
  production_server_key: string;
  production_client_key: string;
}

export interface UpdatePaymentResponse {
  success: boolean;
  code: number;
  message: string;
}

// ─── Generic API Error ────────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}
