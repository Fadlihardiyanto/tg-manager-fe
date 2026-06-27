import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getMe } from '@/features/auth/api/service';
import { navGroups } from '@/config/nav-config';
import { filterNavGroups } from '@/lib/filter-nav';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
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

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <KBar navGroups={filteredGroups}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar navGroups={filteredGroups} />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            {children}
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}

