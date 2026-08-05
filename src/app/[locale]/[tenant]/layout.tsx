import { redirect } from 'next/navigation';
import { getMe } from '@/features/auth/api/service';

/**
 * Tenant layout wrapper.
 * Validates that the [tenant] slug in the URL matches the authenticated client's slug.
 * If slug doesn't match, redirects to /login.
 */
export default async function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const meRes = await getMe();
  if (!meRes.success || !meRes.data) {
    redirect('/login');
  }

  const clientSlug = meRes.data.client?.slug;

  if (!clientSlug || clientSlug !== tenant) {
    // If user is logged in but slug doesn't match, redirect to the correct tenant URL
    if (clientSlug) {
      redirect(`/${clientSlug}/dashboard/overview`);
    }
    redirect('/login');
  }

  return <>{children}</>;
}
