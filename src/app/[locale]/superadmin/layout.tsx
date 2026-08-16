import { DashboardShell } from '@/components/layout/dashboard-shell';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminMe } from '@/features/superadmin/api/service';
import { superadminNavGroups } from '@/config/superadmin-nav-config';
import { filterNavGroups } from '@/lib/filter-nav';

export const metadata: Metadata = {
  title: 'Admin Panel - TG-Manager',
  description: 'Dashboard operator platform TG-Manager',
  robots: { index: false, follow: false }
};

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const meRes = await getAdminMe();

  if (!meRes.success || !meRes.data) {
    redirect('/superadmin/login');
  }

  const adminData = meRes.data;
  const permissions = adminData.permissions ?? [];
  const role = adminData.role ?? 'superadmin';
  const filteredGroups = filterNavGroups(superadminNavGroups, permissions, role);

  return (
    <DashboardShell navGroups={filteredGroups} defaultOpen={false} withTenantBilling={false}>
      {children}
    </DashboardShell>
  );
}
