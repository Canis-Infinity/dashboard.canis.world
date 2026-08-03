// @ts-nocheck
'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnAuth() {
  const router = useRouter();

  function goLogin() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle>權限錯誤</CardTitle>
          <CardDescription>您沒有權限瀏覽此頁面，請先登入。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full" onClick={goLogin}>
            前往登入
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
