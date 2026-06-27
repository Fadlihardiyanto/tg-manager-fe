import { PieGraph } from '@/features/overview/components/pie-graph';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function Stats() {
  await delay(1000);
  return <PieGraph />;
}
