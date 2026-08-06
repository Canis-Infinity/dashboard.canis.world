// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NAVIGATION_GROUPS } from '@/config/navigation';
import { logout } from '@/services/authService';
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

const MOBILE_LOGOUT_DIALOG_DELAY_MS = 350;

export function AppSidebar(props) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logoutDialogTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoutDialogTimerRef.current) {
        clearTimeout(logoutDialogTimerRef.current);
      }
    };
  }, []);

  function handleLogoutDialogOpen(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isMobile) {
      if (logoutDialogTimerRef.current) {
        clearTimeout(logoutDialogTimerRef.current);
      }

      setOpenMobile(false);
      logoutDialogTimerRef.current = setTimeout(() => {
        setLogoutDialogOpen(true);
        logoutDialogTimerRef.current = null;
      }, MOBILE_LOGOUT_DIALOG_DELAY_MS);
      return;
    }

    setLogoutDialogOpen(true);
  }

  async function handleLogout() {
    try {
      const result = await logout();
      toast.success(result.message || '登出成功');
    } catch {
      toast.error('登出請求失敗，已清除本機登入資訊');
    } finally {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-10 gap-3 px-2"
              render={<Link href="/" />}
            >
                <Image
                  src="/favicon.jpg"
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
                      <SidebarMenuButton
                        className="h-10 text-[15px] font-medium"
                        render={<Link href={item.href} />}
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                          <Icon className="size-4" />
                          <span>{item.title}</span>
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
          <Button type="button" variant="ghost" className="h-10 w-full justify-start gap-2 text-[15px] font-medium" aria-label="登出" onClick={handleLogoutDialogOpen}>
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">登出</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認登出？</AlertDialogTitle>
            <AlertDialogDescription>登出後會清除目前登入資訊，並返回登入頁。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>登出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
