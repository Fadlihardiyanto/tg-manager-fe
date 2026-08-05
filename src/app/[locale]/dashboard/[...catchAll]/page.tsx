import { redirect } from 'next/navigation';
import { getMe } from '@/features/auth/api/service';

export default async function DashboardCatchAll({
  params,
  searchParams
}: {
  params: Promise<{ catchAll: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { catchAll } = await params;
  const sParams = await searchParams;

  const meRes = await getMe();
  if (meRes.success && meRes.data?.client?.slug) {
    const slug = meRes.data.client.slug;
    const path = catchAll.join('/');

    // Construct search params query string
    const searchObj = new URLSearchParams();
    for (const [key, val] of Object.entries(sParams)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          val.forEach((v) => searchObj.append(key, v));
        } else {
          searchObj.append(key, val);
        }
      }
    }
    const searchString = searchObj.toString();
    const suffix = searchString ? `?${searchString}` : '';

    redirect(`/${slug}/dashboard/${path}${suffix}`);
  }

  redirect('/login');
}
