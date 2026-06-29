import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  is_email_verified: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

interface AuthClient {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  client: AuthClient | null;
  role: string | null;
  permissions: string[];
  needsOnboarding: boolean;

  setAuth: (data: {
    accessToken: string;
    user: AuthUser;
    client: AuthClient | null;
    role: string;
    permissions?: string[];
    needsOnboarding?: boolean;
  }) => void;

  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  client: null,
  role: null,
  permissions: [],
  needsOnboarding: true,

  setAuth: (data) =>
    set({
      accessToken: data.accessToken,
      user: data.user,
      client: data.client,
      role: data.role,
      permissions: data.permissions ?? [],
      needsOnboarding: data.needsOnboarding ?? false
    }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      client: null,
      role: null,
      permissions: [],
      needsOnboarding: true
    }),

  isAuthenticated: () => {
    const state = get();
    return !!state.accessToken && !!state.user;
  }
}));
