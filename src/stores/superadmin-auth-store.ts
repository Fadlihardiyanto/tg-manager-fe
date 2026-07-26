import { create } from 'zustand';
import type { AdminUser } from '@/features/superadmin/api/types';

interface SuperadminAuthState {
  accessToken: string | null;
  admin: AdminUser | null;
  role: string | null;
  permissions: string[];

  setAuth: (data: {
    accessToken: string;
    admin: AdminUser;
    role: string;
    permissions?: string[];
  }) => void;

  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useSuperadminAuthStore = create<SuperadminAuthState>((set, get) => ({
  accessToken: null,
  admin: null,
  role: null,
  permissions: [],

  setAuth: (data) =>
    set({
      accessToken: data.accessToken,
      admin: data.admin,
      role: data.role,
      permissions: data.permissions ?? []
    }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () =>
    set({
      accessToken: null,
      admin: null,
      role: null,
      permissions: []
    }),

  isAuthenticated: () => {
    const state = get();
    return !!state.accessToken && !!state.admin;
  }
}));
