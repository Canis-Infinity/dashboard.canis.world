// @ts-nocheck
'use client';

import { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { FileUploadField } from '@/components/shared/FileUploadField';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getProfile, updateProfile, uploadProfileAvatar } from '@/services/profileService';
import { getErrorMessage } from '@/utils/apiError';
import { apiAssetUrl } from '@/libs/url';

function cleanProfile(value) {
  const { _id, __v, key, createdAt, updatedAt, ...profile } = value || {};
  return profile;
}

function Field({ id, label, value, onChange, type = 'text', required = false }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} />
    </div>
  );
}

function FieldSkeleton({ wide = false }) {
  return (
    <div className={wide ? 'grid gap-2 md:col-span-2' : 'grid gap-2'}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className={wide ? 'h-24 w-full' : 'h-9 w-full'} />
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="grid gap-6" aria-label="正在載入個人資料">
      <Card>
        <CardHeader className="gap-2 px-4 sm:px-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="grid items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(22rem,1.2fr)]">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-muted/30 p-4">
              <Skeleton className="size-32" />
              <Skeleton className="h-9 w-48 max-w-full" />
            </div>
          </div>
          <div className="grid content-start gap-4">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </CardHeader>
        <CardContent className="grid gap-5">
          <Skeleton className="h-9 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <FieldSkeleton wide />
          <div className="grid gap-4 md:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton wide />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

function LocaleFields({ locale, value, onChange }) {
  const update = (key, nextValue) => onChange({ ...value, [key]: nextValue });
  return (
    <div className="grid gap-5 pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id={`${locale}-name`} label="顯示名稱" value={value?.name} onChange={(next) => update('name', next)} required />
        <Field id={`${locale}-handle`} label="帳號標示" value={value?.handle} onChange={(next) => update('handle', next)} required />
        <Field id={`${locale}-title`} label="頁面標題" value={value?.title} onChange={(next) => update('title', next)} required />
        <Field id={`${locale}-badge`} label="品牌短標" value={value?.badge} onChange={(next) => update('badge', next)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${locale}-description`}>個人介紹</Label>
        <Textarea id={`${locale}-description`} value={value?.description || ''} onChange={(event) => update('description', event.target.value)} className="min-h-28" required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id={`${locale}-metadata-title`} label="搜尋結果標題" value={value?.metadataTitle} onChange={(next) => update('metadataTitle', next)} required />
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor={`${locale}-metadata-description`}>搜尋結果描述</Label>
          <Textarea id={`${locale}-metadata-description`} value={value?.metadataDescription || ''} onChange={(event) => update('metadataDescription', event.target.value)} className="min-h-24" required />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const fetchProfile = useCallback(() => getProfile(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchProfile, [], {
    initialData: null,
    fallbackError: '無法取得 Canis Den 個人資料',
  });
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(cleanProfile(data));
  }, [data]);

  const updateBasic = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateLocale = (locale, value) => setForm((current) => ({
    ...current,
    profile: { ...current.profile, [locale]: value },
  }));

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      let payload = form;
      const avatarFile = new FormData(event.currentTarget).get('avatar');
      if (avatarFile instanceof File && avatarFile.size > 0) {
        const uploadResult = await uploadProfileAvatar(avatarFile);
        payload = { ...form, avatar: uploadResult.data.path };
        setForm(payload);
      }
      const result = await updateProfile(payload);
      toast.success(result.message || '已更新個人資料');
      await refetch();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, '更新失敗'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell title="個人資料" description="管理 Canis Den 前台顯示的品牌資訊、聯絡方式與雙語內容。">
      {error ? <Alert variant="destructive"><AlertTitle>讀取失敗</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {loading || !form ? <ProfilePageSkeleton /> : (
        <form className="grid gap-6" onSubmit={handleSave}>
          <Card>
            <CardHeader className="px-4 sm:px-6"><CardTitle>站台設定</CardTitle><CardDescription>上傳前台頭像，並設定公開 Email 與正式網址。</CardDescription></CardHeader>
            <CardContent className="grid items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(22rem,1.2fr)]">
              <FileUploadField compact id="avatar" name="avatar" title="頭像" description="點擊圖片即可預覽，選擇新圖片後於頁面底部儲存。" helperText="JPG、PNG、WEBP，最大 5MB" previewUrl={apiAssetUrl(form.avatar)} maxSize={5 * 1024 * 1024} accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] }} />
              <div className="grid content-start gap-4">
                <Field id="email" label="公開聯絡信箱" value={form.email} onChange={(value) => updateBasic('email', value)} type="email" required />
                <Field id="site-url" label="正式網站網址" value={form.siteUrl} onChange={(value) => updateBasic('siteUrl', value)} type="url" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>前台文案</CardTitle><CardDescription>分別維護繁體中文與英文版本，搜尋結果資訊也在這裡設定。</CardDescription></CardHeader>
            <CardContent>
              <Tabs defaultValue="zh-TW">
                <TabsList><TabsTrigger value="zh-TW">繁體中文</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="zh-TW"><LocaleFields locale="zh-TW" value={form.profile?.['zh-TW']} onChange={(value) => updateLocale('zh-TW', value)} /></TabsContent>
                <TabsContent value="en"><LocaleFields locale="en" value={form.profile?.en} onChange={(value) => updateLocale('en', value)} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setForm(cleanProfile(data))} disabled={saving}><RotateCcw className="size-4" />還原</Button>
            <Button type="submit" disabled={saving}><Save className="size-4" />{saving ? '儲存中...' : '儲存變更'}</Button>
          </div>
        </form>
      )}
    </DashboardShell>
  );
}
