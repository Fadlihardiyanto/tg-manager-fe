import { redirect } from 'next/navigation';

export default async function Dashboard({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  redirect(`/${tenant}/dashboard/overview`);
}
