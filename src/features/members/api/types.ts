export interface Subscription {
  id: string;
  package_id: string;
  package_name: string;
  status: 'active' | 'expired' | string;
  activated_at: string;
  expired_at: string;
  auto_renew: boolean;
}

export interface Member {
  id: string;
  telegram_user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  global_status: boolean;
  active_packages: string[];
  nearest_expiry: string | null;
  total_orders: number;
  created_at: string;
}

export interface MemberDetail {
  id: string;
  telegram_user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  total_orders: number;
  created_at: string;
  updated_at: string;
  subscriptions: Subscription[];
}

export interface MembersResponse {
  success: boolean;
  code: number;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  data: Member[];
}

export interface MemberDetailResponse {
  success: boolean;
  message: string;
  data: MemberDetail;
}

export interface MemberFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  package_id?: string;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  code?: number;
  errors?: string[];
}

export interface ExtendAccessPayload {
  subscription_id: string;
  additional_days: number;
}
