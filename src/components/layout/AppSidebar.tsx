// @ts-nocheck
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { NAVIGATION_GROUPS } from '@/config/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export function AppSidebar({ onRequestLogout, ...props }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  function handleLogoutRequest() {
    if (isMobile) {
      setOpenMobile(false);
      window.setTimeout(() => onRequestLogout?.(), 320);
      return;
    }

    onRequestLogout?.();
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-10 gap-3 px-2" asChild>
              <Link href="/">
                <Image
                  src="/favicon.png"
                  alt="Canis Den"
                  width={24}
                  height={24}
                  className="logo-theme-filter hidden size-6 object-contain group-data-[collapsible=icon]:block"
                />
                <div className="grid flex-1 min-w-0 gap-1 leading-tight text-left">
                  <span className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
                    Canis Den
                  </span>
                  <span className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {NAVIGATION_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton className="h-10 text-[15px] font-medium" asChild isActive={pathname === item.href} tooltip={item.title}>
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <Button type="button" variant="ghost" className="h-10 w-full justify-start gap-2 text-[15px] font-medium" aria-label="登出" onClick={handleLogoutRequest}>
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">登出</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
