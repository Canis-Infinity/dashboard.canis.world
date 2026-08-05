// @ts-nocheck
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { createProfileLink, deleteProfileLink, getProfile, reorderProfileLinks, updateProfileLink } from '@/services/profileService';
import { getErrorMessage } from '@/utils/apiError';

const domainOptions = [
  { value: 'general', label: '一般領域', description: '顯示在 Canis Den 的預設連結頁。' },
  { value: 'afterDark', label: '深夜領域', description: '顯示在年齡確認後可進入的深夜分頁。' },
  { value: 'work', label: '工作領域', description: '顯示在作品、委託或正式工作相關分頁。' },
];
const domainLabels = Object.fromEntries(domainOptions.map((item) => [item.value, item.label]));

const emptyLink = {
  title: { 'zh-TW': '', en: '' },
  description: { 'zh-TW': '', en: '' },
  href: '', icon: 'Globe', domain: ['general'], category: 'social',
  enabled: true, priority: 100,
};

export default function LinksPage() {
  const fetchProfile = useCallback(() => getProfile(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchProfile, [], { initialData: null, fallbackError: '無法取得連結資料' });
  const [links, setLinks] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [draft, setDraft] = useState(emptyLink);
  const [removeIndex, setRemoveIndex] = useState(-1);
  const [mutating, setMutating] = useState(false);
  const [reorderingId, setReorderingId] = useState('');

  useEffect(() => { if (data?.links) setLinks(data.links); }, [data]);

  function openCreate() {
    const nextPriority = links.length ? Math.max(...links.map((item) => Number(item.priority) || 0)) + 1 : 1;
    setEditingIndex(-1);
    setDraft({ ...emptyLink, title: { ...emptyLink.title }, description: { ...emptyLink.description }, domain: [...emptyLink.domain], priority: nextPriority });
    setEditorOpen(true);
  }

  function openEdit(link) {
    setEditingIndex(links.findIndex((item) => item === link));
    setDraft({ ...link, title: { ...link.title }, description: { ...link.description }, domain: [...(link.domain || [])] });
    setEditorOpen(true);
  }

  function updateLocalized(group, locale, value) {
    setDraft((current) => ({ ...current, [group]: { ...current[group], [locale]: value } }));
  }

  function toggleDomain(domain, checked) {
    setDraft((current) => ({
      ...current,
      domain: checked ? Array.from(new Set([...(current.domain || []), domain])) : (current.domain || []).filter((item) => item !== domain),
    }));
  }

  async function applyDraft(event) {
    event.preventDefault();
    if (!draft.title?.['zh-TW'] || !draft.title?.en || !draft.href || !draft.domain?.length) {
      toast.error('請填寫雙語標題、網址，並至少選擇一個顯示區域');
      return;
    }
    setMutating(true);
    try {
      const { _id, ...linkFields } = draft;
      const payload = { ...linkFields, external: true, priority: Number(draft.priority) || 0 };
      const result = editingIndex >= 0
        ? await updateProfileLink(links[editingIndex]._id, payload)
        : await createProfileLink(payload);
      toast.success(result.message || (editingIndex >= 0 ? '連結更新成功' : '連結新增成功'));
      setEditorOpen(false);
      await refetch();
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, '連結儲存失敗'));
    } finally {
      setMutating(false);
    }
  }

  async function confirmDelete() {
    const link = links[removeIndex];
    if (!link?._id) return;
    setMutating(true);
    try {
      const result = await deleteProfileLink(link._id);
      toast.success(result.message || '連結刪除成功');
      setRemoveIndex(-1);
      await refetch();
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, '連結刪除失敗'));
    } finally {
      setMutating(false);
    }
  }

  const sortedLinks = useMemo(
    () => [...links].sort((a, b) => a.priority - b.priority),
    [links]
  );

  async function moveLink(link, direction) {
    const currentIndex = sortedLinks.findIndex((item) => item._id === link._id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sortedLinks.length || reorderingId) return;

    const reordered = [...sortedLinks];
    [reordered[currentIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[currentIndex]];
    const normalized = reordered.map((item, index) => ({ ...item, priority: index + 1 }));

    setReorderingId(link._id);
    setLinks(normalized);
    try {
      const result = await reorderProfileLinks(normalized.map((item) => item._id));
      toast.success(result.message || '連結排序更新成功');
      await refetch();
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError, '連結排序更新失敗'));
      await refetch();
    } finally {
      setReorderingId('');
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'priority',
      enableSorting: false,
      header: '排序',
      cell: ({ row }) => <span className="tabular-nums">{sortedLinks.findIndex((item) => item._id === row.original._id) + 1}</span>,
    },
    { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="標題" />, cell: ({ row }) => <div><div className="font-medium">{row.original.title?.['zh-TW']}</div><div className="text-xs text-muted-foreground">{row.original.title?.en}</div></div> },
    { accessorKey: 'domain', header: ({ column }) => <DataTableColumnHeader column={column} title="顯示區域" />, cell: ({ row }) => <div className="flex flex-wrap gap-1">{(row.original.domain || []).map((item) => <Badge key={item} variant="secondary">{domainLabels[item] || item}</Badge>)}</div> },
    { accessorKey: 'enabled', header: ({ column }) => <DataTableColumnHeader column={column} title="狀態" />, cell: ({ row }) => <Badge variant={row.original.enabled ? 'default' : 'secondary'}>{row.original.enabled ? '顯示' : '隱藏'}</Badge> },
    { id: 'actions', enableSorting: false, header: () => <div className="text-right">動作</div>, meta: { headerClassName: 'text-right', cellClassName: 'text-right' }, cell: ({ row }) => { const index = sortedLinks.findIndex((item) => item._id === row.original._id); const isReordering = Boolean(reorderingId); return <div className="flex justify-end gap-1">
      <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" disabled={index <= 0 || isReordering} onClick={() => moveLink(row.original, -1)} aria-label="上移連結"><ArrowUp className="size-4" /></Button></TooltipTrigger><TooltipContent>上移</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" disabled={index >= sortedLinks.length - 1 || isReordering} onClick={() => moveLink(row.original, 1)} aria-label="下移連結"><ArrowDown className="size-4" /></Button></TooltipTrigger><TooltipContent>下移</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" onClick={() => window.open(row.original.href, '_blank', 'noopener,noreferrer')} aria-label="開啟連結"><ExternalLink className="size-4" /></Button></TooltipTrigger><TooltipContent>開啟連結</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" onClick={() => openEdit(row.original)} aria-label="編輯連結"><Pencil className="size-4" /></Button></TooltipTrigger><TooltipContent>編輯連結</TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => setRemoveIndex(links.findIndex((item) => item === row.original))} aria-label="刪除連結"><Trash2 className="size-4" /></Button></TooltipTrigger><TooltipContent>刪除連結</TooltipContent></Tooltip>
    </div>; } },
  ], [links, reorderingId, sortedLinks]);

  return (
    <DashboardShell title="連結管理" description="新增、編輯與排序 canis-den 首頁的社群、作品及合作入口。" action={<Button type="button" onClick={openCreate}><Plus className="size-4" />新增連結</Button>}>
      {error ? <Alert variant="destructive"><AlertTitle>讀取失敗</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={loading ? [] : sortedLinks}
            loading={loading}
            pageSize={10}
            emptyText="尚未建立連結"
            emptyDescription="新增第一筆連結後，就會同步顯示在 Canis Den 網站。"
          />
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90svh] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="px-6 pt-6"><DialogTitle>{editingIndex >= 0 ? '編輯連結' : '新增連結'}</DialogTitle><DialogDescription>設定前台顯示文字、目標網址、區域與排序。</DialogDescription></DialogHeader>
          <form onSubmit={applyDraft} className="grid min-h-0">
            <div className="grid max-h-[65svh] overflow-y-auto">
              <section className="grid gap-4 px-6 py-5">
                <div><h3 className="text-sm font-semibold">基本資料</h3><p className="text-xs text-muted-foreground">設定目標網址與圖示；排序請直接在外部表格調整。</p></div>
                <div className="grid gap-2"><Label htmlFor="href">目標網址</Label><Input id="href" type="url" value={draft.href || ''} placeholder="例如：http://example.com" onChange={(event) => setDraft({ ...draft, href: event.target.value })} required /></div>
                <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="icon">圖示名稱</Label><Input id="icon" value={draft.icon || ''} placeholder="例如：instagram" onChange={(event) => setDraft({ ...draft, icon: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="priority">排序</Label><Input id="priority" type="number" value={draft.priority} readOnly aria-readonly="true" className="bg-muted/40" /></div></div>
              </section>
              <section className="grid gap-4 border-t px-6 py-5">
                <div><h3 className="text-sm font-semibold">前台文案</h3><p className="text-xs text-muted-foreground">分別維護繁體中文與英文版本。</p></div>
                <Tabs defaultValue="zh-TW">
                  <TabsList><TabsTrigger value="zh-TW">繁體中文</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                  <TabsContent value="zh-TW" className="grid gap-4 pt-2"><div className="grid gap-2"><Label htmlFor="title-zh">標題</Label><Input id="title-zh" value={draft.title?.['zh-TW'] || ''} placeholder="請輸入繁體中文標題" onChange={(event) => updateLocalized('title', 'zh-TW', event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="description-zh">說明</Label><Textarea id="description-zh" className="min-h-28" value={draft.description?.['zh-TW'] || ''} placeholder="請輸入繁體中文說明" onChange={(event) => updateLocalized('description', 'zh-TW', event.target.value)} /></div></TabsContent>
                  <TabsContent value="en" className="grid gap-4 pt-2"><div className="grid gap-2"><Label htmlFor="title-en">Title</Label><Input id="title-en" value={draft.title?.en || ''} placeholder="請輸入英文標題" onChange={(event) => updateLocalized('title', 'en', event.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="description-en">Description</Label><Textarea id="description-en" className="min-h-28" value={draft.description?.en || ''} placeholder="請輸入英文說明" onChange={(event) => updateLocalized('description', 'en', event.target.value)} /></div></TabsContent>
                </Tabs>
              </section>
              <section className="grid gap-4 border-t px-6 py-5">
                <div><h3 className="text-sm font-semibold">顯示設定</h3><p className="text-xs text-muted-foreground">選擇這筆連結會出現在哪些內容領域。</p></div>
                <div className="grid gap-2 sm:grid-cols-3">{domainOptions.map((option) => { const checkboxId = `domain-${option.value}`; return <FieldLabel key={option.value} htmlFor={checkboxId} className="cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/30"><Field className="grid-cols-[auto_minmax(0,1fr)] items-start gap-3"><Checkbox id={checkboxId} checked={draft.domain?.includes(option.value)} onCheckedChange={(checked) => toggleDomain(option.value, checked === true)} /><FieldContent><span className="text-sm font-medium">{option.label}</span><FieldDescription>{option.description}</FieldDescription></FieldContent></Field></FieldLabel>; })}</div>
                <FieldLabel htmlFor="link-enabled" className="cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/30"><Field className="grid-cols-[auto_minmax(0,1fr)] items-start gap-3"><Checkbox id="link-enabled" checked={draft.enabled} onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked === true })} /><FieldContent><span className="text-sm font-medium">啟用此連結</span><FieldDescription>關閉後會保留資料，但不會顯示在 Canis Den 網站。</FieldDescription></FieldContent></Field></FieldLabel>
              </section>
            </div>
            <DialogFooter className="border-t px-6 py-4"><DialogClose asChild><Button type="button" variant="outline" disabled={mutating}>取消</Button></DialogClose><Button type="submit" disabled={mutating}>{mutating ? '儲存中...' : '儲存'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={removeIndex >= 0} onOpenChange={(open) => !open && setRemoveIndex(-1)} title="刪除連結" description={`確定刪除「${links[removeIndex]?.title?.['zh-TW'] || ''}」？此操作會立即同步至前台。`} confirmText="刪除" onConfirm={confirmDelete} />
    </DashboardShell>
  );
}
