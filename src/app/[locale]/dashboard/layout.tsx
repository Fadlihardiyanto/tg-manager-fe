import { DashboardShell } from '@/components/layout/dashboard-shell';
import type { Metadata } from 'next';
import { getMe } from '@/features/auth/api/service';
import { navGroups } from '@/config/nav-config';
import { filterNavGroups } from '@/lib/filter-nav';

export const metadata: Metadata = {
  title: 'Dashboard TG-Manager',
  description: 'Dashboard dasar untuk TG-Manager',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const meRes = await getMe();
  const userData = meRes.success ? meRes.data : null;
  const permissions = userData?.permissions ?? [];
  const role = userData?.role ?? null;
  const filteredGroups = filterNavGroups(navGroups, permissions, role);

  return (
    <DashboardShell navGroups={filteredGroups} defaultOpen={false}>
      {children}
    </DashboardShell>
  );
}
