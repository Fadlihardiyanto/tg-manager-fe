import { BarGraph } from '@/features/overview/components/bar-graph';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function BarStats() {
  await delay(1000);
  return <BarGraph />;
}
