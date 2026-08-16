export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_two_fa_enabled?: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  failed_login_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    requires_2fa: boolean;
    // when requires_2fa === false — direct login:
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    user?: AdminUser;
    roles?: string[];
    // when requires_2fa === true — need OTP first:
    temp_token?: string;
    otp_expires_in?: number;
  };
}

export interface AdminOtpVerifyRequest {
  temp_token: string;
  otp_code: string;
}

export interface AdminOtpVerifyResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: AdminUser;
    roles?: string[];
  };
}

export interface AdminOtpResendRequest {
  temp_token: string;
}

export interface AdminOtpResendResponse {
  success: boolean;
  code: number;
  message: string;
}

export interface AdminRefreshResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface AdminMeResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    admin: AdminUser;
    role: string;
    permissions: string[];
  };
}

export interface AdminLogoutResponse {
  success: boolean;
  message: string;
}

// ─── Generic Wrapper ─────────────────────────────────────────────────

export interface ListResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T[];
}

export interface PaginatedListResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ─── Roles & Permissions ─────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  group: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface SyncPermissionsRequest {
  permission_ids: string[];
}

// ─── Admin Users ─────────────────────────────────────────────────────

export interface AdminUserDetail extends AdminUser {
  roles?: Role[];
  permissions?: string[];
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  role_id?: string;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface SyncAdminRolesRequest {
  role_ids: string[];
}

// ─── Clients / Tenants ───────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  slug: string;
  category?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientUser {
  id: string;
  client_id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateClientRequest {
  name: string;
  slug: string;
  category?: string;
}

export interface UpdateClientRequest {
  name?: string;
  slug?: string;
  category?: string;
}

export interface CreateClientUserRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateClientUserRequest {
  name?: string;
  email?: string;
}

// ─── Billing / Plans ─────────────────────────────────────────────────

export interface BillingPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  max_bots: number;
  max_groups: number;
  max_members: number;
  max_packages: number;
  max_custom_commands: number;
  max_broadcasts: number;
  allow_media_broadcast: boolean;
  allow_discount_system: boolean;
  allow_reports_export: boolean;
  allow_high_priority: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  max_bots: number;
  max_groups: number;
  max_members: number;
  max_packages: number;
  max_custom_commands: number;
  max_broadcasts: number;
  allow_media_broadcast?: boolean;
  allow_discount_system?: boolean;
  allow_reports_export?: boolean;
  allow_high_priority?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  max_bots?: number;
  max_groups?: number;
  max_members?: number;
  max_packages?: number;
  max_custom_commands?: number;
  max_broadcasts?: number;
  allow_media_broadcast?: boolean;
  allow_discount_system?: boolean;
  allow_reports_export?: boolean;
  allow_high_priority?: boolean;
  is_active?: boolean;
}

export interface ClientSubscription {
  id: string;
  client_id: string;
  client_name: string;
  plan_id: string;
  plan_name: string;
  status: 'pending' | 'active' | 'past_due' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

export interface AssignPlanRequest {
  client_id: string;
  plan_id: string;
  duration_days: number;
}

// ─── Audit Logs ─────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}
