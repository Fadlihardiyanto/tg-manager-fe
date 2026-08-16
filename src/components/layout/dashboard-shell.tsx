'use client';

import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import QueryProvider from '@/components/layout/query-provider';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ActivePlanProvider } from '@/features/billing/components/active-plan-provider';
import type { NavGroup } from '@/types';

interface DashboardShellProps {
  navGroups: NavGroup[];
  defaultOpen: boolean;
  children: React.ReactNode;
  /** Mount the tenant billing provider (quota/plan). Disable on non-tenant shells. */
  withTenantBilling?: boolean;
}

export function DashboardShell({
  navGroups,
  defaultOpen,
  children,
  withTenantBilling = true
}: DashboardShellProps) {
  return (
    <KBar navGroups={navGroups}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar navGroups={navGroups} />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            <QueryProvider>
              {withTenantBilling ? (
                <ActivePlanProvider>
                  {children}
                  <InfoSidebar side='right' />
                </ActivePlanProvider>
              ) : (
                <>
                  {children}
                  <InfoSidebar side='right' />
                </>
              )}
            </QueryProvider>
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
