export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  confirm_password?: string;
}

export interface RegisterResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      avatar_url: string;
      is_email_verified: boolean;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface VerifyEmailResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      avatar_url: string;
      is_email_verified: boolean;
      last_login_at: string;
      created_at: string;
      updated_at: string;
    };
    client: any | null;
    role: string;
    needs_onboarding: boolean;
  };
}

export interface OnboardingRequest {
  business_name: string;
  business_slug: string;
}

export interface OnboardingResponse {
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  code: number;
  message: string;
}

// ─── Resend Email Verification ────────────────────────────────────────
// POST /api/v1/auth/resend-verification
// Used on: (1) Check-email page after register, (2) Login 403 unverified flow
export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  code: number;
  message: string;
}

// ─── Tenant Login ────────────────────────────────────────────────────
// Returns the same shape as VerifyEmailResponse (JWT + user + client + onboarding flag).
// When needs_onboarding is true, FE must redirect to /onboarding.

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      avatar_url: string;
      is_email_verified: boolean;
      last_login_at: string;
      created_at: string;
      updated_at: string;
    };
    client: any | null;
    role: string;
    needs_onboarding: boolean;
  };
}

export interface MeResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      is_email_verified: boolean;
    };
    client: {
      id: string;
      name: string;
      slug: string;
    } | null;
    role: string;
    permissions: string[];
    needs_onboarding: boolean;
  };
}

