import { AreaGraph } from '@/features/overview/components/area-graph';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function AreaStats() {
  await delay(2000);
  return <AreaGraph />;
}
