import { RecentSales } from '@/features/overview/components/recent-sales';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function Sales() {
  await delay(3000);
  return <RecentSales />;
}
