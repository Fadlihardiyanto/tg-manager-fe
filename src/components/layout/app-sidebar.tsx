'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import type { NavGroup } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/features/auth/api/service';
import { routing } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import * as React from 'react';
import { Icons } from '../icons';

import { useTenantPath } from '@/lib/tenant-path';

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/$/, '');

  if (normalized === '') return '/';

  const localePrefix = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);
  const withoutLocale = normalized.replace(localePrefix, '') || '/';

  return withoutLocale === '' ? '/' : withoutLocale;
}

function isActivePath(pathname: string, url: string) {
  if (!url || url === '#') return false;

  const currentPath = normalizePathname(pathname);
  const targetPath = normalizePathname(url);

  if (currentPath === targetPath) return true;

  // Detail pages (e.g. /dashboard/members/[id]) keep their parent menu highlighted
  return currentPath.startsWith(`${targetPath}/`);
}

function AvatarInitial() {
  const user = useAuthStore((s) => s.user);
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className='flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0'>
      {initial}
    </div>
  );
}

export default function AppSidebar({ navGroups }: { navGroups: NavGroup[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getTenantHref } = useTenantPath();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'>
          <div className='flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg'>
            <Image
              src='/assets/uration-blue-logo.png'
              alt='Urator'
              width={28}
              height={28}
              className='h-7 w-7 object-contain'
              priority
            />
          </div>
          <div className='min-w-0 group-data-[collapsible=icon]:hidden'>
            <p className='truncate text-base font-bold tracking-tight'>Urator</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const tenantUrl = getTenantHref(item.url);
                const isItemActive = isActivePath(pathname, tenantUrl);
                const hasActiveChild = item.items?.some((subItem) =>
                  isActivePath(pathname, getTenantHref(subItem.url))
                );
                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={item.isActive || hasActiveChild}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isItemActive || hasActiveChild}
                        >
                          {item.icon && <Icon />}
                          <span className='group-data-[collapsible=icon]:hidden'>{item.title}</span>
                          <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden' />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const subTenantUrl = getTenantHref(subItem.url);
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActivePath(pathname, subTenantUrl)}
                                >
                                  <Link href={subTenantUrl}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isItemActive}
                      className='transition-all duration-150 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold'
                    >
                      <Link href={tenantUrl}>
                        <Icon className='size-4' />
                        <span className='group-data-[collapsible=icon]:hidden'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  aria-label='Menu akun'
                  className='px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <AvatarInitial />
                  <span className='truncate text-sm font-medium group-data-[collapsible=icon]:hidden'>
                    Akun
                  </span>
                  <Icons.chevronsDown className='ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl'
                side='bottom'
                align='end'
                sideOffset={6}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='text-muted-foreground px-2 py-1.5 text-sm'>Kelola akun Anda</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='rounded-lg'>
                  <Icons.notification className='mr-2 h-4 w-4' />
                  Notifikasi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='rounded-lg text-destructive focus:text-destructive'
                  onClick={async () => {
                    await logout();
                    useAuthStore.getState().clearAuth();
                    router.push('/login');
                  }}
                >
                  <Icons.logout className='mr-2 h-4 w-4' />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
