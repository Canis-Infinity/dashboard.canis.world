// @ts-nocheck
'use client';

import { Home, LogIn, RefreshCw, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

export function ErrorEmptyState({
  title,
  description,
  retry,
  showBack = true,
  showHome = true,
  showLogin = true,
}) {
  const router = useRouter();

  function clearAuthAndGoLogin() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <main className="grid min-h-svh w-full place-items-center bg-background p-6">
      <Empty className="w-full max-w-xl rounded-xl border bg-card p-8 md:p-10">
        <EmptyHeader>
          <EmptyTitle className="text-2xl">{title}</EmptyTitle>
          <EmptyDescription className="text-base">{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex w-full flex-row flex-wrap justify-center gap-2">
            {retry ? (
              <Button type="button" variant="outline" onClick={retry}>
                <RefreshCw className="size-4" />
                再試一次
              </Button>
            ) : null}
            {showBack ? (
              <Button type="button" variant="outline" onClick={() => router.back()}>
                <RotateCcw className="size-4" />
                上一頁
              </Button>
            ) : null}
            {showHome ? (
              <Button type="button" variant="secondary" onClick={() => router.push('/')}>
                <Home className="size-4" />
                返回首頁
              </Button>
            ) : null}
            {showLogin ? (
              <Button type="button" onClick={clearAuthAndGoLogin}>
                <LogIn className="size-4" />
              返回登入頁
              </Button>
            ) : null}
          </div>
          <EmptyDescription>如果問題持續發生，請聯絡系統管理員。</EmptyDescription>
        </EmptyContent>
      </Empty>
    </main>
  );
}
