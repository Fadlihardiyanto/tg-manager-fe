import type { ApiResponse } from '@/features/bots/api/types';

export type BillingCycle = 'monthly' | 'yearly';

export type BillingStatus =
  | 'pending'
  | 'active'
  | 'upgraded'
  | 'past_due'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | string;

export interface PlatformPlanFeature {
  name: string;
  included: boolean;
}

export interface ActivePlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly?: string;
  price_yearly?: string;
  max_bots: number;
  max_groups: number;
  max_packages: number;
  max_members: number;
  max_custom_commands: number;
  max_broadcasts: number;
  allow_media_broadcast: boolean;
  allow_discount_system: boolean;
  allow_reports_export: boolean;
  allow_high_priority: boolean;
  transaction_limit: number;
  features?: PlatformPlanFeature[] | Record<string, boolean>;
  is_active?: boolean;
  is_landing_page?: boolean;
}

export interface ActivePlanUsage {
  bots: number;
  groups: number;
  packages: number;
  members: number;
  custom_commands: number;
  broadcasts: number;
}

export interface ClientBriefResponse {
  id: string;
  name: string;
  slug: string;
}

export interface ActiveBilling {
  id: string;
  client?: ClientBriefResponse;
  status: BillingStatus;
  billing_cycle: BillingCycle;
  amount?: string;
  original_amount?: string;
  discount_amount?: string;
  started_at: string;
  expired_at: string;
  paid_at?: string;
  payment_url?: string;
  snap_token?: string;
  order_id?: string;
  client_key?: string;
  receipt_url?: string;
  note?: string;
  is_manual?: boolean;
  created_at?: string;
  plan: ActivePlan;
  usage?: ActivePlanUsage;
}

export type ActiveBillingResponse = ApiResponse<ActiveBilling>;

export type PublicPlansResponse = ApiResponse<ActivePlan[]>;

export interface CheckoutBillingRequest {
  plan_id: string;
  billing_cycle: BillingCycle;
}

export interface CheckoutBillingData {
  payment_url?: string;
  snap_token?: string;
  order_id?: string;
  client_key?: string;
}

export type CheckoutBillingResponse = ApiResponse<CheckoutBillingData>;

export interface BillingHistoryFilters {
  page?: number;
  limit?: number;
}

export type BillingHistoryItem = ActiveBilling;

export type BillingHistoryResponse = ApiResponse<BillingHistoryItem[]>;
