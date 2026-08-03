// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { login } from '@/services/authService';
import { getErrorMessage } from '@/utils/apiError';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const result = await login(new FormData(event.currentTarget));
      localStorage.setItem('token', JSON.stringify(result));
      toast.success(result.message || '登入成功');
      router.push('/');
    } catch (error) {
      toast.error(getErrorMessage(error, '登入失敗'));
    }
  }

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-7 py-10 md:bg-muted md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8 md:max-w-4xl">
        <Card className="border-0 bg-transparent p-0 shadow-none md:overflow-hidden md:border md:border-border/80 md:bg-card md:shadow-xl md:shadow-black/10">
          <div className="grid md:min-h-[560px] md:grid-cols-[0.95fr_1.05fr]">
            <aside className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white md:flex md:flex-col md:justify-between">
              <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
              <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="Canis Den" className="size-10 rounded-lg object-cover" />
                <div className="grid leading-tight">
                  <span className="text-lg font-semibold">Canis Den</span>
                  <span className="text-xs text-white/60">Dashboard</span>
                </div>
              </div>
              <div className="grid gap-4">
                <p className="text-3xl font-semibold tracking-normal">後台管理入口</p>
                <p className="max-w-xs text-sm leading-6 text-white/65">
                  管理 Canis Den 的首頁資料、社群連結與聯絡訊息，讓前台內容保持最新。
                </p>
              </div>
            </aside>
            <section className="flex min-h-[calc(100svh-10rem)] flex-col justify-center md:min-h-[560px]">
              <CardHeader className="space-y-4 px-0 pb-6 pt-0 text-center md:px-10 md:pb-4 md:pt-8 md:text-left">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg border bg-background text-muted-foreground md:mx-0">
                  <LockKeyhole className="size-5" />
                </div>
                <div className="grid gap-1">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>使用管理員帳號登入後台</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0 pt-0 md:px-10 md:pb-8 md:pt-2">
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="username">帳號</Label>
                    <Input id="username" name="username" type="text" autoComplete="username" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">密碼</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className="pr-10"
                        required
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9"
                            aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                            onClick={() => setShowPassword((value) => !value)}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{showPassword ? '隱藏密碼' : '顯示密碼'}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="grid gap-3 pt-2">
                    <Button type="submit" className="w-full">登入</Button>
                    <Button type="reset" variant="secondary" className="w-full">重設</Button>
                  </div>
                </form>
              </CardContent>
            </section>
          </div>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          © 2026{' '}
          <a href="https://canis.world/" target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline">
            Canis Den
          </a>
        </p>
      </div>
    </main>
  );
}
