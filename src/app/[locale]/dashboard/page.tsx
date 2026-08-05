import { redirect } from 'next/navigation';
import { getMe } from '@/features/auth/api/service';

export default async function Dashboard() {
  const meRes = await getMe();
  if (meRes.success && meRes.data?.client?.slug) {
    redirect(`/${meRes.data.client.slug}/dashboard/overview`);
  }
  redirect('/login');
}
