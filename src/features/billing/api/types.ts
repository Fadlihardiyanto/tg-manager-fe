import type { ApiResponse } from '@/features/bots/api/types';

export interface ActivePlan {
  id: string;
  name: string;
  display_name: string;
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
}

export interface ActivePlanUsage {
  bots: number;
  groups: number;
  packages: number;
  members: number;
  custom_commands: number;
  broadcasts: number;
}

export interface ActiveBilling {
  id: string;
  status: string;
  billing_cycle: string;
  started_at: string;
  expired_at: string;
  plan: ActivePlan;
  usage: ActivePlanUsage;
}

export type ActiveBillingResponse = ApiResponse<ActiveBilling>;
