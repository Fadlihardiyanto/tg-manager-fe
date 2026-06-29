import { RecentSales } from '@/features/overview/components/recent-sales';
import { getAnalyticsOverview } from '@/features/overview/api/service';

export default async function Sales() {
  const data = await getAnalyticsOverview();
  return <RecentSales data={data.recent_orders} />;
}
