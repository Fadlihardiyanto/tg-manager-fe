'use server';

import { apiClient } from '@/lib/api-client';
import { cookies } from 'next/headers';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminOtpVerifyRequest,
  AdminOtpVerifyResponse,
  AdminOtpResendRequest,
  AdminOtpResendResponse,
  AdminMeResponse,
  AdminLogoutResponse
} from './types';

const ADMIN_TOKEN = 'admin_access_token';
const ADMIN_REFRESH = 'admin_refresh_token';

const TOKEN_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/'
} as const;

export async function loginAdmin(data: AdminLoginRequest): Promise<AdminLoginResponse> {
  try {
    const res = await apiClient<AdminLoginResponse>('/admin/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (res.success && res.data?.requires_2fa === false && res.data.access_token) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_TOKEN, res.data.access_token, {
        ...TOKEN_CONFIG,
        maxAge: res.data.expires_in
      });
      cookieStore.set(ADMIN_REFRESH, res.data.refresh_token!, {
        ...TOKEN_CONFIG,
        maxAge: 30 * 24 * 60 * 60
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, code: 400, message };
  }
}

export async function verifyAdminOtp(data: AdminOtpVerifyRequest): Promise<AdminOtpVerifyResponse> {
  try {
    const res = await apiClient<AdminOtpVerifyResponse>('/admin/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (res.success && res.data?.access_token) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_TOKEN, res.data.access_token, {
        ...TOKEN_CONFIG,
        maxAge: res.data.expires_in
      });
      cookieStore.set(ADMIN_REFRESH, res.data.refresh_token, {
        ...TOKEN_CONFIG,
        maxAge: 30 * 24 * 60 * 60
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OTP verification failed';
    return { success: false, code: 400, message };
  }
}

export async function resendAdminOtp(data: AdminOtpResendRequest): Promise<AdminOtpResendResponse> {
  try {
    return await apiClient<AdminOtpResendResponse>('/admin/v1/auth/otp/resend', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend failed';
    return { success: false, code: 400, message };
  }
}

export async function getAdminMe(): Promise<AdminMeResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN)?.value;

  if (!token) {
    return { success: false, code: 401, message: 'No admin access token', data: undefined };
  }

  try {
    const { apiClient } = await import('@/lib/api-client');
    const res = await apiClient<any>('/admin/v1/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengambil profil admin';
    return { success: false, code: 400, message, data: undefined };
  }
}

export async function refreshAdminToken() {
  const cookieStore = await cookies();
  const rToken = cookieStore.get(ADMIN_REFRESH)?.value;

  if (!rToken) {
    return { success: false, code: 401, message: 'No admin refresh token' };
  }

  try {
    const { apiClient } = await import('@/lib/api-client');
    const res = await apiClient<any>('/admin/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rToken })
    });

    if (res.success && res.data?.access_token) {
      try {
        cookieStore.set(ADMIN_TOKEN, res.data.access_token, {
          ...TOKEN_CONFIG,
          maxAge: res.data.expires_in || 3600
        });
        if (res.data.refresh_token) {
          cookieStore.set(ADMIN_REFRESH, res.data.refresh_token, {
            ...TOKEN_CONFIG,
            maxAge: 30 * 24 * 60 * 60
          });
        }
      } catch {
        // SSR render phase — safe to ignore
      }
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Admin refresh failed';
    return { success: false, code: 400, message };
  }
}

export async function logoutAdmin(): Promise<AdminLogoutResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN)?.value;

  if (token) {
    try {
      await apiClient('/admin/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // best-effort
    }
  }

  cookieStore.delete(ADMIN_TOKEN);
  cookieStore.delete(ADMIN_REFRESH);
  return { success: true, message: 'Logged out' };
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN)?.value ?? null;
}

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAdminToken();
  return apiClient<T>(endpoint, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ? options.headers : {})
    }
  });
}

// ─── Roles ───────────────────────────────────────────────────────────

import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  SyncPermissionsRequest,
  AdminUserDetail,
  CreateAdminRequest,
  UpdateAdminRequest,
  SyncAdminRolesRequest,
  Client,
  ClientUser,
  CreateClientRequest,
  UpdateClientRequest,
  CreateClientUserRequest,
  UpdateClientUserRequest,
  BillingPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
  ClientSubscription,
  AssignPlanRequest,
  AuditLog,
  SingleResponse,
  ListResponse,
  PaginatedListResponse
} from './types';

export async function getRoles(page = 1, limit = 20): Promise<PaginatedListResponse<Role>> {
  try {
    return await adminFetch<PaginatedListResponse<Role>>(
      `/admin/v1/roles?page=${page}&limit=${limit}`
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function getRole(id: string): Promise<SingleResponse<Role>> {
  try {
    return await adminFetch<SingleResponse<Role>>(`/admin/v1/roles/${id}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function createRole(data: CreateRoleRequest): Promise<SingleResponse<Role>> {
  try {
    return await adminFetch<SingleResponse<Role>>('/admin/v1/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function updateRole(
  id: string,
  data: UpdateRoleRequest
): Promise<SingleResponse<Role>> {
  try {
    return await adminFetch<SingleResponse<Role>>(`/admin/v1/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function deleteRole(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/roles/${id}`, { method: 'DELETE' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function syncPermissions(
  id: string,
  data: SyncPermissionsRequest
): Promise<SingleResponse<Role>> {
  try {
    return await adminFetch<SingleResponse<Role>>(`/admin/v1/roles/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function getPermissions(): Promise<ListResponse<Permission>> {
  try {
    return await adminFetch<ListResponse<Permission>>('/admin/v1/permissions');
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

// ─── Admin Users ─────────────────────────────────────────────────────

export async function getAdmins(
  page = 1,
  limit = 20,
  search?: string
): Promise<PaginatedListResponse<AdminUserDetail>> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return await adminFetch<PaginatedListResponse<AdminUserDetail>>(`/admin/v1/admins?${params}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function getAdmin(id: string): Promise<SingleResponse<AdminUserDetail>> {
  try {
    return await adminFetch<SingleResponse<AdminUserDetail>>(`/admin/v1/admins/${id}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function createAdmin(
  data: CreateAdminRequest
): Promise<SingleResponse<AdminUserDetail>> {
  try {
    return await adminFetch<SingleResponse<AdminUserDetail>>('/admin/v1/admins', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function updateAdmin(
  id: string,
  data: UpdateAdminRequest
): Promise<SingleResponse<AdminUserDetail>> {
  try {
    return await adminFetch<SingleResponse<AdminUserDetail>>(`/admin/v1/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function deleteAdmin(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/admins/${id}`, { method: 'DELETE' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function activateAdmin(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/admins/${id}/activate`, { method: 'PATCH' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function deactivateAdmin(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/admins/${id}/deactivate`, { method: 'PATCH' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function syncAdminRoles(
  id: string,
  data: SyncAdminRolesRequest
): Promise<SingleResponse<AdminUserDetail>> {
  try {
    return await adminFetch<SingleResponse<AdminUserDetail>>(`/admin/v1/admins/${id}/roles`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

// ─── Clients / Tenants ───────────────────────────────────────────────

export interface ClientFilters {
  name?: string;
  active?: string;
}

export async function getClients(
  page = 1,
  limit = 20,
  filters: ClientFilters = {}
): Promise<PaginatedListResponse<Client>> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.name) params.set('name', filters.name);
    if (filters.active) params.set('active', filters.active);
    return await adminFetch<PaginatedListResponse<Client>>(`/admin/v1/clients?${params}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function getClient(id: string): Promise<SingleResponse<Client>> {
  try {
    return await adminFetch<SingleResponse<Client>>(`/admin/v1/clients/${id}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function createClient(data: CreateClientRequest): Promise<SingleResponse<Client>> {
  try {
    return await adminFetch<SingleResponse<Client>>('/admin/v1/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function updateClient(
  id: string,
  data: UpdateClientRequest
): Promise<SingleResponse<Client>> {
  try {
    return await adminFetch<SingleResponse<Client>>(`/admin/v1/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function deleteClient(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/clients/${id}`, { method: 'DELETE' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function activateClient(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/clients/${id}/activate`, { method: 'PATCH' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function deactivateClient(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/clients/${id}/deactivate`, { method: 'PATCH' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

export async function getClientUsers(clientId: string): Promise<ListResponse<ClientUser>> {
  try {
    return await adminFetch<ListResponse<ClientUser>>(`/admin/v1/clients/${clientId}/users`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function createClientUser(
  clientId: string,
  data: CreateClientUserRequest
): Promise<SingleResponse<ClientUser>> {
  try {
    return await adminFetch<SingleResponse<ClientUser>>(`/admin/v1/clients/${clientId}/users`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

// ─── Plans ───────────────────────────────────────────────────────────

export async function getPlans(): Promise<ListResponse<BillingPlan>> {
  try {
    return await adminFetch<ListResponse<BillingPlan>>('/admin/v1/billing/plans');
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function getPlan(id: string): Promise<SingleResponse<BillingPlan>> {
  try {
    return await adminFetch<SingleResponse<BillingPlan>>(`/admin/v1/billing/plans/${id}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function createPlan(data: CreatePlanRequest): Promise<SingleResponse<BillingPlan>> {
  try {
    return await adminFetch<SingleResponse<BillingPlan>>('/admin/v1/billing/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function updatePlan(
  id: string,
  data: UpdatePlanRequest
): Promise<SingleResponse<BillingPlan>> {
  try {
    return await adminFetch<SingleResponse<BillingPlan>>(`/admin/v1/billing/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function deletePlan(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/billing/plans/${id}`, { method: 'DELETE' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

// ─── Subscriptions ───────────────────────────────────────────────────

export async function getClientSubscriptions(): Promise<ListResponse<ClientSubscription>> {
  try {
    return await adminFetch<ListResponse<ClientSubscription>>('/admin/v1/billing');
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}

export async function assignPlanToClient(
  data: AssignPlanRequest
): Promise<SingleResponse<ClientSubscription>> {
  try {
    return await adminFetch<SingleResponse<ClientSubscription>>('/admin/v1/billing/assign', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: null as any };
  }
}

export async function cancelSubscription(
  id: string
): Promise<{ success: boolean; code: number; message: string }> {
  try {
    return await adminFetch(`/admin/v1/billing/${id}`, { method: 'DELETE' });
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m };
  }
}

// ─── Audit Logs ─────────────────────────────────────────────────────

export interface AuditLogFilters {
  action?: string;
  resource?: string;
}

export async function getAuditLogs(
  page = 1,
  limit = 20,
  filters: AuditLogFilters = {}
): Promise<PaginatedListResponse<AuditLog>> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.action) params.set('action', filters.action);
    if (filters.resource) params.set('resource', filters.resource);
    return await adminFetch<PaginatedListResponse<AuditLog>>(`/admin/v1/audit-logs?${params}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Failed';
    return { success: false, code: 400, message: m, data: [] };
  }
}
