// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UnAuth from '@/components/shared/UnAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { logout } from '@/services/authService';

export default function DashboardShell({
  title,
  description,
  action = null,
  commandActions = [],
  children,
  className = '',
}) {
  const authenticated = useAuth();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const result = await logout();
      toast.success(result.message || '登出成功');
    } catch {
      toast.error('登出請求失敗，已清除本機登入資訊');
    } finally {
      localStorage.removeItem('token');
      setLogoutOpen(false);
      setLoggingOut(false);
      router.push('/login');
    }
  }

  if (!authenticated) return <UnAuth />;

  return (
    <>
      <SidebarProvider>
        <AppSidebar onRequestLogout={() => setLogoutOpen(true)} />
        <SidebarInset>
          <SiteHeader title={title} action={action} commandActions={commandActions || []} />
          <div className="@container/main flex flex-1 flex-col pt-14 md:pt-[4.5rem]">
            <div className={cn('mx-auto flex w-full max-w-none flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6 2xl:max-w-[1680px]', className)}>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">{title}</h1>
                {description ? <p className="max-w-3xl text-sm text-muted-foreground">{description}</p> : null}
              </div>
              {children}
              <footer className="pt-4 mt-auto text-sm border-t text-muted-foreground">
                © 2026{' '}
                <a href="https://canis.world/" target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline">
                  Canis Den
                </a>
              </footer>
            </div>
          </div>
          <ScrollToTopButton />
        </SidebarInset>
      </SidebarProvider>

      <AlertDialog open={logoutOpen} onOpenChange={(open) => !loggingOut && setLogoutOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認登出？</AlertDialogTitle>
            <AlertDialogDescription>登出後會清除目前登入資訊，並返回登入頁。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={loggingOut}>{loggingOut ? '登出中...' : '登出'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
