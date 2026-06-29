export interface AnalyticsOverview {
  total_revenue_this_month: string;
  total_active_members: number;
  total_groups: number;
  total_members_in_groups: number;
  success_transactions: number;
  revenue_chart: RevenueChartItem[];
  package_popularity: PackagePopularityItem[];
  recent_orders: RecentOrder[];
}

export interface RevenueChartItem {
  date: string;
  revenue: string;
}

export interface PackagePopularityItem {
  package_name: string;
  count: number;
}

export interface RecentOrder {
  id: string;
  external_id: string;
  member_name: string;
  member_username: string;
  package_name: string;
  amount: string;
  status: string;
  created_at: string;
}
