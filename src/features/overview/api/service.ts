'use server';

import { apiClient } from '@/lib/api-client';
import { getAuthHeaders } from '@/lib/auth-headers';
import type { AnalyticsOverview } from './types';

const DEFAULTS: AnalyticsOverview = {
  total_revenue_this_month: '0',
  total_active_members: 0,
  total_groups: 0,
  total_members_in_groups: 0,
  success_transactions: 0,
  revenue_chart: [],
  package_popularity: [],
  recent_orders: []
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    const res = await apiClient<any>('/api/v1/tenant/analytics/overview', {
      headers: await getAuthHeaders()
    });
    // ponytail: handle both wrapped { data: ... } and direct response
    const d = (res.data ?? res) as AnalyticsOverview;
    return {
      total_revenue_this_month: d.total_revenue_this_month ?? DEFAULTS.total_revenue_this_month,
      total_active_members: d.total_active_members ?? DEFAULTS.total_active_members,
      total_groups: d.total_groups ?? DEFAULTS.total_groups,
      total_members_in_groups: d.total_members_in_groups ?? DEFAULTS.total_members_in_groups,
      success_transactions: d.success_transactions ?? DEFAULTS.success_transactions,
      revenue_chart: d.revenue_chart ?? DEFAULTS.revenue_chart,
      package_popularity: d.package_popularity ?? DEFAULTS.package_popularity,
      recent_orders: d.recent_orders ?? DEFAULTS.recent_orders
    };
  } catch {
    return { ...DEFAULTS };
  }
}
