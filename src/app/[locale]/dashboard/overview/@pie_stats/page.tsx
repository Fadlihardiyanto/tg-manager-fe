import { PieGraph } from '@/features/overview/components/pie-graph';
import { getAnalyticsOverview } from '@/features/overview/api/service';

export default async function Stats() {
  const data = await getAnalyticsOverview();
  return <PieGraph data={data.package_popularity} />;
}
