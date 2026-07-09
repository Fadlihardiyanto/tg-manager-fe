'use server';

import { apiClient } from '@/lib/api-client';
import {
  RegisterRequest,
  RegisterResponse,
  VerifyEmailResponse,
  OnboardingRequest,
  OnboardingResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
} from './types';
import { cookies } from 'next/headers';

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    return await apiClient<RegisterResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  try {
    const res = await apiClient<VerifyEmailResponse>(
      `/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
      {
        method: 'GET'
      }
    );

    if (res.success && res.data?.access_token) {
      const cookieStore = await cookies();
      cookieStore.set('access_token', res.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: res.data.expires_in,
        path: '/'
      });
      cookieStore.set('refresh_token', res.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    return res;
  } catch (err) {
    // Return a typed error response instead of throwing,
    // so the client mutation's onError can handle it cleanly
    // without Next.js surfacing an opaque digested error.
    const message = err instanceof Error ? err.message : 'Verification failed';
    return {
      success: false,
      code: 400,
      message,
      data: undefined as any
    };
  }
}

export async function submitOnboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  try {
    const res = await apiClient<OnboardingResponse>('/api/v1/clients/onboarding', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (res.success && res.data?.access_token) {
      cookieStore.set('access_token', res.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: res.data.expires_in,
        path: '/'
      });
      cookieStore.set('refresh_token', res.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onboarding submission failed';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  try {
    return await apiClient<ForgotPasswordResponse>('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return { success: false, code: 400, message };
  }
}

// ─── Resend Email Verification ────────────────────────────────────────
// POST /api/v1/auth/resend-verification
// Used on: (1) Check-email page after register, (2) Login 403 unverified flow
export async function resendVerification(
  data: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  try {
    return await apiClient<ResendVerificationResponse>('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend failed';
    return { success: false, code: 400, message };
  }
}

// ─── Tenant Login ────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Returns JWT + needs_onboarding flag. If needs_onboarding is true,
// the FE must redirect to /onboarding after storing the token.
export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const res = await apiClient<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Auto-login: persist JWT to httpOnly cookies
    if (res.success && res.data?.access_token) {
      const cookieStore = await cookies();
      cookieStore.set('access_token', res.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: res.data.expires_in,
        path: '/'
      });
      cookieStore.set('refresh_token', res.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, code: 400, message, data: undefined as any };
  }
}

// ─── Tenant Logout ───────────────────────────────────────────────────
export async function logout(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const rToken = cookieStore.get('refresh_token')?.value;

  // Call backend to invalidate refresh token
  if (rToken) {
    try {
      await apiClient('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: rToken })
      });
    } catch {
      // Backend logout is best-effort
    }
  }

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  return { success: true };
}

// ─── Get Current User Profile ──────────────────────────────────────────
export async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { success: false, code: 401, message: 'No access token', data: null };
  }

  try {
    // Import MeResponse here or at the top
    const { apiClient } = await import('@/lib/api-client');
    const res = await apiClient<any>('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil profil';
    return { success: false, code: 400, message, data: null };
  }
}

// ─── Refresh Token ───────────────────────────────────────────────────
export async function refreshToken() {
  const cookieStore = await cookies();
  const rToken = cookieStore.get('refresh_token')?.value;

  if (!rToken) {
    return { success: false, code: 401, message: 'No refresh token' };
  }

  try {
    const { apiClient } = await import('@/lib/api-client');
    const res = await apiClient<any>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rToken })
    });

    if (res.success && res.data?.access_token) {
      try {
        cookieStore.set('access_token', res.data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: res.data.expires_in || 3600,
          path: '/'
        });
        if (res.data.refresh_token) {
          cookieStore.set('refresh_token', res.data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60,
            path: '/'
          });
        }
      } catch {
        // During SSR rendering, cookieStore.set() may throw because
        // cookies cannot be mutated inside the render phase. The token
        // refresh API call itself succeeded — we simply can't persist
        // to cookies right now. This is safe to ignore.
      }
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refresh failed';
    return { success: false, code: 400, message };
  }
}
