import { BarGraph } from '@/features/overview/components/bar-graph';
import { getAnalyticsOverview } from '@/features/overview/api/service';

export default async function BarStats() {
  const data = await getAnalyticsOverview();
  return <BarGraph data={data.revenue_chart} />;
}
