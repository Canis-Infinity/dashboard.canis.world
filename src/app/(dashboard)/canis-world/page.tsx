// @ts-nocheck
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ImageIcon,
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ContentCollections } from "@/components/features/canis-world/ContentCollections";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field as CheckboxField,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  createCanisWorldEntry,
  deleteCanisWorldEntry,
  getCanisWorldAdmin,
  updateCanisWorldEntry,
  updateCanisWorldSettings,
  uploadCanisWorldMedia,
} from "@/services/canisWorldService";
import { getErrorMessage } from "@/utils/apiError";

const emptyEntry = {
  title: "",
  excerpt: "",
  content: "",
  category: "daily",
  mood: "",
  occurredAt: new Date().toISOString().slice(0, 10),
  tags: [],
  images: [],
  featured: false,
  published: true,
  priority: 100,
};

const managementSections = [
  { value: "status", label: "今日狀態" },
  { value: "profile", label: "角色介紹" },
  { value: "footer", label: "頁尾版權" },
  { value: "content", label: "頁面文案" },
  { value: "faqs", label: "常見問題" },
  { value: "features", label: "資訊卡片" },
  { value: "entries", label: "日常紀錄" },
];

const baseCategoryOptions = [
  "日常",
  "出遊",
  "基地生活",
  "照片",
  "創作",
  "活動",
  "紀錄",
  "daily",
];

const baseMoodOptions = [
  "開心",
  "安靜",
  "放鬆",
  "興奮",
  "有點累",
  "想睡",
  "專注",
  "慢慢整理",
];

function normalizeEntry(entry = emptyEntry) {
  return {
    ...emptyEntry,
    ...entry,
    occurredAt: entry.occurredAt
      ? new Date(entry.occurredAt).toISOString().slice(0, 10)
      : emptyEntry.occurredAt,
    tagsText: (entry.tags || []).join(", "),
    images: [...(entry.images || [])],
  };
}

function resolveImagePreview(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/uploads/")) return path;
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return `http://localhost:7654${path.startsWith("/") ? path : `/${path}`}`;
  }
  return `https://canis.world${path.startsWith("/") ? path : `/${path}`}`;
}

function imageName(path) {
  try {
    return decodeURIComponent(String(path).split("/").at(-1) || "照片");
  } catch {
    return "照片";
  }
}

function stripEntryMeta(entry) {
  const { _id, createdAt, updatedAt, tagsText, ...payload } = entry;
  return payload;
}

function EntryOrderButtons({ entry, entries, onMove, disabled }) {
  const index = entries.findIndex((current) => current._id === entry._id);

  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="日常紀錄往上移"
            disabled={disabled || index <= 0}
            onClick={() => onMove(entry, -1)}
          >
            <ArrowUp className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>往上移</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="日常紀錄往下移"
            disabled={disabled || index < 0 || index >= entries.length - 1}
            onClick={() => onMove(entry, 1)}
          >
            <ArrowDown className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>往下移</TooltipContent>
      </Tooltip>
    </div>
  );
}

function splitList(value, separator = ",") {
  return String(value || "")
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueOptions(baseOptions, entries, key) {
  return Array.from(
    new Set([
      ...baseOptions,
      ...entries.map((entry) => entry?.[key]).filter(Boolean),
    ])
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function SuggestionCombobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        items={options}
        value={value || null}
        inputValue={value || ""}
        onValueChange={(nextValue) => onChange(nextValue || "")}
        onInputValueChange={(nextValue) => onChange(nextValue)}
        autoHighlight="always"
      >
        <ComboboxInput id={id} placeholder={placeholder} />
        <ComboboxContent>
          <ComboboxEmpty>沒有符合的選項，可直接輸入新值。</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function CanisWorldSkeleton() {
  return (
    <div className="grid gap-6">
      {[0, 1, 2, 3].map((section) => (
        <Card key={section}>
          <CardHeader className="gap-1.5 space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: section === 0 ? 5 : 4 }).map((_, index) => (
              <div
                key={index}
                className={
                  index === 4 ? "grid gap-2 md:col-span-2" : "grid gap-2"
                }
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton
                  className={index === 4 ? "h-24 w-full" : "h-10 w-full"}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="gap-1.5 space-y-0">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </CardHeader>
        <CardContent className="grid gap-3 border-t p-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CanisWorldPage() {
  const fetchData = useCallback(() => getCanisWorldAdmin(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchData, [], {
    initialData: null,
    fallbackError: "無法取得 Canis World 資料",
  });
  const [settings, setSettings] = useState(null);
  const [entries, setEntries] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(normalizeEntry());
  const [editingId, setEditingId] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [removeImageIndex, setRemoveImageIndex] = useState(null);
  const [mutating, setMutating] = useState(false);
  const [activeSection, setActiveSection] = useState("status");
  const settingsFormRef = useRef(null);
  const editorFormRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    setSettings({
      status: data.status || {},
      profile: data.profile || {},
      content: data.content || {},
      footer: data.footer || {},
    });
    setEntries(data.entries || []);
  }, [data]);

  useEffect(() => {
    function handleSaveShortcut(event) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s")
        return;
      event.preventDefault();
      if (savingSettings || mutating) return;

      const form = editorOpen ? editorFormRef.current : settingsFormRef.current;
      form?.requestSubmit();
    }

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [editorOpen, mutating, savingSettings]);

  function updateStatus(key, value) {
    setSettings((current) => ({
      ...current,
      status: { ...current.status, [key]: value },
    }));
  }

  function updateProfile(key, value) {
    setSettings((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value },
    }));
  }

  function updateFooter(key, value) {
    setSettings((current) => ({
      ...current,
      footer: { ...current.footer, [key]: value },
    }));
  }

  function updateContent(key, value) {
    setSettings((current) => ({
      ...current,
      content: { ...current.content, [key]: value },
    }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        status: settings.status,
        profile: {
          ...settings.profile,
          traits: splitList(
            settings.profile?.traitsText ??
              settings.profile?.traits?.join(", "),
          ),
        },
        content: settings.content,
        footer: settings.footer,
      };
      const result = await updateCanisWorldSettings(payload);
      toast.success(result.message || "Canis World 設定已更新");
      await refetch();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "設定儲存失敗"));
    } finally {
      setSavingSettings(false);
    }
  }

  function openCreate() {
    const nextPriority = entries.length
      ? Math.max(...entries.map((item) => Number(item.priority) || 0)) + 1
      : 1;
    setEditingId("");
    setRemoveImageIndex(null);
    setDraft(normalizeEntry({ ...emptyEntry, priority: nextPriority }));
    setEditorOpen(true);
  }

  function openEdit(entry) {
    setEditingId(entry._id);
    setRemoveImageIndex(null);
    setDraft(normalizeEntry(entry));
    setEditorOpen(true);
  }

  async function uploadImages(event) {
    const files = event.target.files;
    if (!files?.length) return;
    setMutating(true);
    try {
      const result = await uploadCanisWorldMedia(files);
      const paths = result.data.map((item) => item.path);
      setDraft((current) => ({
        ...current,
        images: [...(current.images || []), ...paths],
      }));
      toast.success(result.message || "圖片上傳成功");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError, "圖片上傳失敗"));
    } finally {
      event.target.value = "";
      setMutating(false);
    }
  }

  function moveImage(index, offset) {
    setDraft((current) => {
      const images = [...(current.images || [])];
      const target = index + offset;
      if (target < 0 || target >= images.length) return current;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  }

  function removeImage(index) {
    setDraft((current) => ({
      ...current,
      images: (current.images || []).filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
    setRemoveImageIndex(null);
  }

  async function applyDraft(event) {
    event.preventDefault();
    setMutating(true);
    try {
      const { _id, tagsText, ...fields } = draft;
      const payload = {
        ...fields,
        tags: splitList(tagsText),
        images: draft.images || [],
        priority: Number(draft.priority) || 0,
      };
      const result = editingId
        ? await updateCanisWorldEntry(editingId, payload)
        : await createCanisWorldEntry(payload);
      toast.success(result.message || "日常紀錄已儲存");
      setEditorOpen(false);
      await refetch();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, "日常紀錄儲存失敗"));
    } finally {
      setMutating(false);
    }
  }

  async function confirmDelete() {
    if (!removeId) return;
    setMutating(true);
    try {
      const result = await deleteCanisWorldEntry(removeId);
      toast.success(result.message || "日常紀錄已刪除");
      setRemoveId("");
      await refetch();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, "日常紀錄刪除失敗"));
    } finally {
      setMutating(false);
    }
  }

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0),
      ),
    [entries],
  );
  const publishedEntries = useMemo(
    () => sortedEntries.filter((entry) => entry.published),
    [sortedEntries],
  );
  const heroSourceEntry = useMemo(() => {
    const selectedId = settings?.content?.heroEntryId;
    return (
      publishedEntries.find((entry) => entry._id === selectedId) ||
      publishedEntries.find((entry) => entry.featured) ||
      publishedEntries[0]
    );
  }, [publishedEntries, settings?.content?.heroEntryId]);
  const heroImageOptions = heroSourceEntry?.images || [];
  const selectedHeroImage = heroImageOptions.includes(
    settings?.content?.heroImage,
  )
    ? settings.content.heroImage
    : heroImageOptions[0] || "";

  function selectHeroEntry(value) {
    if (!value) return;
    const heroEntryId = value === "__featured__" ? "" : value;
    const nextEntry =
      publishedEntries.find((entry) => entry._id === heroEntryId) ||
      publishedEntries.find((entry) => entry.featured) ||
      publishedEntries[0];

    setSettings((current) => ({
      ...current,
      content: {
        ...current.content,
        heroEntryId,
        heroImage: nextEntry?.images?.[0] || "",
      },
    }));
  }

  async function moveEntry(entry, direction) {
    const index = sortedEntries.findIndex((current) => current._id === entry._id);
    const target = sortedEntries[index + direction];
    if (index < 0 || !target) return;

    const currentPriority = Number(entry.priority) || index + 1;
    const targetPriority = Number(target.priority) || index + direction + 1;

    setMutating(true);
    try {
      await Promise.all([
        updateCanisWorldEntry(entry._id, {
          ...stripEntryMeta(entry),
          priority: targetPriority,
        }),
        updateCanisWorldEntry(target._id, {
          ...stripEntryMeta(target),
          priority: currentPriority,
        }),
      ]);
      toast.success("日常紀錄排序已更新");
      await refetch();
    } catch (moveError) {
      toast.error(getErrorMessage(moveError, "日常紀錄排序更新失敗"));
    } finally {
      setMutating(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="標題" />
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.excerpt}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "occurredAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="日期" />
        ),
        cell: ({ row }) =>
          new Date(row.original.occurredAt).toLocaleDateString("zh-TW"),
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="分類" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.category}</Badge>
        ),
      },
      {
        accessorKey: "featured",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="精選" />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.featured ? "default" : "outline"}>
            {row.original.featured ? "精選" : "一般"}
          </Badge>
        ),
      },
      {
        accessorKey: "published",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="狀態" />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.published ? "default" : "secondary"}>
            {row.original.published ? "公開" : "隱藏"}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        enableSorting: false,
        header: () => <div className="whitespace-nowrap">排序</div>,
        cell: ({ row }) => (
          <EntryOrderButtons
            entry={row.original}
            entries={sortedEntries}
            disabled={mutating}
            onMove={moveEntry}
          />
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="text-right">動作</div>,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(row.original)}
                  aria-label="編輯日常"
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>編輯</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setRemoveId(row.original._id)}
                  aria-label="刪除日常"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刪除</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [mutating, sortedEntries],
  );

  const traitsText =
    settings?.profile?.traitsText ??
    (settings?.profile?.traits || []).join(", ");
  const categoryOptions = useMemo(
    () => uniqueOptions(baseCategoryOptions, entries, "category"),
    [entries]
  );
  const moodOptions = useMemo(
    () => uniqueOptions(baseMoodOptions, entries, "mood"),
    [entries]
  );

  return (
    <DashboardShell
      title="Canis World"
      description="管理 canis.world 的人型犬日常、今日狀態、照片與公開紀錄。"
      action={
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          新增日常
        </Button>
      }
    >
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>讀取失敗</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading || !settings ? (
        <CanisWorldSkeleton />
      ) : (
        <>
          <Tabs
            value={activeSection}
            onValueChange={setActiveSection}
            className="hidden min-w-0 md:block"
          >
            <div className="scrollbar-none overflow-x-auto overflow-y-hidden">
              <TabsList
                variant="line"
                className="w-max min-w-full flex-nowrap justify-start gap-6"
              >
                {managementSections.map((section) => (
                  <TabsTrigger
                    key={section.value}
                    value={section.value}
                    variant="line"
                  >
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          <div className="grid gap-2 md:hidden">
            <Label htmlFor="management-section">管理區塊</Label>
            <Select value={activeSection} onValueChange={setActiveSection}>
              <SelectTrigger id="management-section">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {managementSections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form
            ref={settingsFormRef}
            onSubmit={saveSettings}
            className="grid gap-6"
          >
            <Card className={activeSection !== "status" ? "hidden" : ""}>
              <CardHeader className="gap-1.5 space-y-0">
                <CardTitle>今日狀態</CardTitle>
                <CardDescription>
                  首頁第一眼會看到的 Canis 狀態面板。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field
                  id="status-label"
                  label="狀態"
                  value={settings.status?.label}
                  onChange={(value) => updateStatus("label", value)}
                />
                <Field
                  id="status-mood"
                  label="心情"
                  value={settings.status?.mood}
                  onChange={(value) => updateStatus("mood", value)}
                />
                <Field
                  id="status-doing"
                  label="正在做"
                  value={settings.status?.doing}
                  onChange={(value) => updateStatus("doing", value)}
                />
                <Field
                  id="status-location"
                  label="出沒地點"
                  value={settings.status?.location}
                  onChange={(value) => updateStatus("location", value)}
                />
                <div className="grid gap-2">
                  <Label htmlFor="status-note">一句話</Label>
                  <Textarea
                    id="status-note"
                    value={settings.status?.note || ""}
                    onChange={(event) =>
                      updateStatus("note", event.target.value)
                    }
                    className="min-h-20"
                  />
                </div>
                <div className="grid content-start gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="status-completeness">今日狀態完整度</Label>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {Number(settings.status?.completeness) || 0}%
                    </span>
                  </div>
                  <Slider
                    id="status-completeness"
                    value={Number(settings.status?.completeness) || 0}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      updateStatus("completeness", value)
                    }
                    aria-label="今日狀態完整度"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={activeSection !== "profile" ? "hidden" : ""}>
              <CardHeader className="gap-1.5 space-y-0">
                <CardTitle>角色介紹</CardTitle>
                <CardDescription>
                  Canis World 的公開簡介，不取代 iistw.com 的正式身分。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field
                  id="display-name"
                  label="顯示名稱"
                  value={settings.profile?.displayName}
                  onChange={(value) => updateProfile("displayName", value)}
                />
                <Field
                  id="subtitle"
                  label="副標題"
                  value={settings.profile?.subtitle}
                  onChange={(value) => updateProfile("subtitle", value)}
                />
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="intro">介紹</Label>
                  <Textarea
                    id="intro"
                    value={settings.profile?.intro || ""}
                    onChange={(event) =>
                      updateProfile("intro", event.target.value)
                    }
                    className="min-h-24"
                  />
                </div>
                <Field
                  id="traits"
                  label="特徵標籤，逗號分隔"
                  value={traitsText}
                  onChange={(value) => updateProfile("traitsText", value)}
                />
              </CardContent>
            </Card>

            <Card className={activeSection !== "footer" ? "hidden" : ""}>
              <CardHeader className="gap-1.5 space-y-0">
                <CardTitle>頁尾版權</CardTitle>
                <CardDescription>
                  設定 canis.world 頁尾顯示的擁有者、連結與權利文字。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field
                  id="footer-owner"
                  label="擁有者名稱"
                  value={settings.footer?.owner}
                  onChange={(value) => updateFooter("owner", value)}
                />
                <Field
                  id="footer-owner-url"
                  label="擁有者連結"
                  type="url"
                  value={settings.footer?.ownerUrl}
                  onChange={(value) => updateFooter("ownerUrl", value)}
                />
                <div className="md:col-span-2">
                  <Field
                    id="footer-rights"
                    label="權利文字"
                    value={settings.footer?.rightsText}
                    onChange={(value) => updateFooter("rightsText", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={activeSection !== "content" ? "hidden" : ""}>
              <CardHeader className="gap-1.5 space-y-0">
                <CardTitle>頁面文案</CardTitle>
                <CardDescription>
                  管理首頁導覽、成人提醒、照片牆與關於區塊。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="header-link-label"
                    label="右上按鈕文字"
                    value={settings.content?.headerLinkLabel}
                    onChange={(value) =>
                      updateContent("headerLinkLabel", value)
                    }
                  />
                  <Field
                    id="header-link-url"
                    label="右上按鈕連結"
                    type="url"
                    value={settings.content?.headerLinkUrl}
                    onChange={(value) => updateContent("headerLinkUrl", value)}
                  />
                  <div className="grid gap-3 md:col-span-2">
                    <div className="grid max-w-2xl gap-2">
                      <Label htmlFor="hero-entry">關聯日常紀錄</Label>
                      <Select
                        value={
                          settings.content?.heroEntryId || "__featured__"
                        }
                        onValueChange={selectHeroEntry}
                      >
                        <SelectTrigger id="hero-entry" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__featured__">
                            自動使用第一筆精選日常
                          </SelectItem>
                          {publishedEntries.map((entry) => (
                              <SelectItem key={entry._id} value={entry._id}>
                                {entry.title}
                                {entry.occurredAt
                                  ? ` · ${String(entry.occurredAt).slice(0, 10)}`
                                  : ""}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs leading-5 text-muted-foreground">
                        主視覺卡片的分類、日期、標題與摘要會取自這筆公開日常紀錄。
                      </p>
                    </div>
                    <div className="grid max-w-2xl gap-2">
                      <Label>首頁主視覺圖片</Label>
                      {heroImageOptions.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {heroImageOptions.map((path, index) => {
                            const selected = path === selectedHeroImage;
                            return (
                              <button
                                key={`${path}-${index}`}
                                type="button"
                                aria-pressed={selected}
                                aria-label={`選擇第 ${index + 1} 張照片作為首頁主視覺`}
                                className={`relative aspect-video overflow-hidden rounded-lg border bg-muted outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50 ${
                                  selected
                                    ? "border-primary ring-2 ring-primary"
                                    : "hover:border-foreground/40"
                                }`}
                                onClick={() => updateContent("heroImage", path)}
                              >
                                <img
                                  src={resolveImagePreview(path)}
                                  alt={`第 ${index + 1} 張照片`}
                                  loading="lazy"
                                  className="absolute inset-0 size-full object-cover"
                                />
                                {selected ? (
                                  <span className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                    <Check className="size-4" />
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid min-h-28 place-items-center gap-2 rounded-lg border border-dashed bg-muted/15 p-6 text-center">
                          <ImageIcon className="size-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            這筆日常沒有照片，請先到日常紀錄加入照片。
                          </p>
                        </div>
                      )}
                      <p className="text-xs leading-5 text-muted-foreground">
                        只能選擇關聯日常內的照片，確保主視覺與卡片內容一致。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                  <Field
                    id="adult-title"
                    label="成人提醒標題"
                    value={settings.content?.adultTitle}
                    onChange={(value) => updateContent("adultTitle", value)}
                  />
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="adult-description">成人提醒內容</Label>
                    <Textarea
                      id="adult-description"
                      value={settings.content?.adultDescription || ""}
                      onChange={(event) =>
                        updateContent("adultDescription", event.target.value)
                      }
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                  <Field
                    id="gallery-badge"
                    label="照片牆標籤"
                    value={settings.content?.galleryBadge}
                    onChange={(value) => updateContent("galleryBadge", value)}
                  />
                  <Field
                    id="gallery-title"
                    label="照片牆標題"
                    value={settings.content?.galleryTitle}
                    onChange={(value) => updateContent("galleryTitle", value)}
                  />
                  <Field
                    id="about-badge"
                    label="關於區標籤"
                    value={settings.content?.aboutBadge}
                    onChange={(value) => updateContent("aboutBadge", value)}
                  />
                  <Field
                    id="about-title"
                    label="關於區標題"
                    value={settings.content?.aboutTitle}
                    onChange={(value) => updateContent("aboutTitle", value)}
                  />
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="about-description">關於區介紹</Label>
                    <Textarea
                      id="about-description"
                      value={settings.content?.aboutDescription || ""}
                      onChange={(event) =>
                        updateContent("aboutDescription", event.target.value)
                      }
                      className="min-h-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div
              className={`flex justify-end ${
                ["status", "profile", "footer", "content"].includes(
                  activeSection,
                )
                  ? ""
                  : "hidden"
              }`}
            >
              <Button type="submit" disabled={savingSettings}>
                <Save className="size-4" />
                {savingSettings ? "儲存中..." : "儲存設定"}
              </Button>
            </div>
          </form>

          <ContentCollections
            faqs={data.faqs || []}
            featureCards={data.featureCards || []}
            onChanged={refetch}
            activeSection={activeSection}
          />

          <Card
            className={`overflow-hidden ${
              activeSection !== "entries" ? "hidden" : ""
            }`}
          >
            <CardHeader className="gap-1.5 space-y-0">
              <CardTitle>日常紀錄</CardTitle>
              <CardDescription>
                公開後會同步顯示在 canis.world。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={sortedEntries}
                pageSize={10}
                emptyText="尚未建立日常紀錄"
                emptyDescription="新增第一筆日常後，Canis World 就會開始有生活感。"
              />
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="grid max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 max-sm:left-0 max-sm:top-0 max-sm:h-svh max-sm:max-h-svh max-sm:w-screen max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0">
          <DialogHeader className="min-w-0 px-4 pt-4 pr-12 text-left sm:px-6 sm:pt-6">
            <DialogTitle>{editingId ? "編輯日常" : "新增日常"}</DialogTitle>
            <DialogDescription className="text-pretty">
              管理日常文字、分類、照片與公開狀態。
            </DialogDescription>
          </DialogHeader>
          <form
            ref={editorFormRef}
            onSubmit={applyDraft}
            className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden"
          >
            <div className="grid min-h-0 min-w-0 gap-5 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  id="entry-title"
                  label="標題"
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                  required
                />
                <Field
                  id="entry-date"
                  label="日期"
                  type="date"
                  value={draft.occurredAt}
                  onChange={(value) =>
                    setDraft({ ...draft, occurredAt: value })
                  }
                />
                <SuggestionCombobox
                  id="entry-category"
                  label="分類"
                  value={draft.category}
                  onChange={(value) => setDraft({ ...draft, category: value })}
                  options={categoryOptions}
                  placeholder="選擇或輸入分類"
                />
                <SuggestionCombobox
                  id="entry-mood"
                  label="心情"
                  value={draft.mood}
                  onChange={(value) => setDraft({ ...draft, mood: value })}
                  options={moodOptions}
                  placeholder="選擇或輸入心情"
                />
                <Field
                  id="entry-tags"
                  label="標籤，逗號分隔"
                  value={draft.tagsText}
                  onChange={(value) => setDraft({ ...draft, tagsText: value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-excerpt">摘要</Label>
                <Textarea
                  id="entry-excerpt"
                  value={draft.excerpt || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, excerpt: event.target.value })
                  }
                  className="min-h-20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-content">內容</Label>
                <Textarea
                  id="entry-content"
                  value={draft.content || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, content: event.target.value })
                  }
                  className="min-h-36"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>照片</Label>
                  <Badge variant="secondary">
                    {draft.images?.length || 0} 張
                  </Badge>
                </div>

                {draft.images?.length ? (
                  <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                    {draft.images.map((path, index) => (
                      <div
                        key={`${path}-${index}`}
                        className="min-w-0 overflow-hidden rounded-lg border bg-muted/20"
                      >
                        <div
                          role="img"
                          aria-label={`${draft.title || "日常"}的第 ${index + 1} 張照片`}
                          className="aspect-video bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(resolveImagePreview(path))})`,
                          }}
                        >
                          <Badge
                            className="m-2 bg-background/85 text-foreground backdrop-blur-sm"
                            variant="outline"
                          >
                            {index + 1}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 border-t p-2">
                          <span
                            className="min-w-0 flex-1 truncate px-1 text-xs text-muted-foreground"
                            title={imageName(path)}
                          >
                            {imageName(path)}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === 0 || mutating}
                                onClick={() => moveImage(index, -1)}
                                aria-label="照片往前移"
                              >
                                <ArrowLeft className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>往前移</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={
                                  index === draft.images.length - 1 || mutating
                                }
                                onClick={() => moveImage(index, 1)}
                                aria-label="照片往後移"
                              >
                                <ArrowRight className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>往後移</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                disabled={mutating}
                                onClick={() => setRemoveImageIndex(index)}
                                aria-label="移除照片"
                              >
                                <X className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>移除</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Label
                    htmlFor="media-upload"
                    className="grid min-h-36 cursor-pointer place-items-center gap-2 rounded-lg border border-dashed bg-muted/15 p-6 text-center transition-colors hover:bg-muted/30"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </span>
                    <span>
                      <span className="block font-medium">新增第一張照片</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        JPG、PNG 或 WebP，單張最多 12 MB
                      </span>
                    </span>
                  </Label>
                )}

                <div className="grid min-w-0 gap-2 sm:flex sm:items-center sm:gap-3">
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Label
                        htmlFor="media-upload"
                        className="w-full cursor-pointer sm:w-fit"
                      />
                    }
                    disabled={mutating}
                  >
                    <ImagePlus className="size-4" />
                    {draft.images?.length ? "新增照片" : "選擇照片"}
                  </Button>
                  <span className="min-w-0 text-xs leading-5 text-muted-foreground">
                    可一次選取多張，上方順序會同步到前台。
                  </span>
                  <Input
                    id="media-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="sr-only"
                    disabled={mutating}
                    onChange={uploadImages}
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <FieldLabel className="cursor-pointer rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-muted/30">
                  <CheckboxField className="grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <Checkbox
                      checked={draft.featured}
                      onCheckedChange={(checked) =>
                        setDraft({ ...draft, featured: checked === true })
                      }
                    />
                    <FieldContent>
                      <span className="text-sm font-medium">設為精選</span>
                      <FieldDescription>
                        會出現在首頁的日常紀錄區塊；未勾選仍可保留在完整相簿與資料表。
                      </FieldDescription>
                    </FieldContent>
                  </CheckboxField>
                </FieldLabel>
                <FieldLabel className="cursor-pointer rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-muted/30">
                  <CheckboxField className="grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  <Checkbox
                    checked={draft.published}
                    onCheckedChange={(checked) =>
                      setDraft({ ...draft, published: checked === true })
                    }
                  />
                    <FieldContent>
                      <span className="text-sm font-medium">公開顯示</span>
                      <FieldDescription>
                        勾選後會同步顯示在 canis.world；關閉時只保留在後台管理。
                      </FieldDescription>
                    </FieldContent>
                  </CheckboxField>
                </FieldLabel>
              </div>
            </div>
            <DialogFooter className="border-t px-4 py-4 sm:px-6">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={mutating}>
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutating}>
                {mutating ? "儲存中..." : "儲存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeImageIndex !== null}
        onOpenChange={(open) => !open && setRemoveImageIndex(null)}
        title="移除照片"
        description={`確定要移除「${
          removeImageIndex !== null
            ? imageName(draft.images?.[removeImageIndex])
            : ""
        }」嗎？儲存日常後，此變更將無法復原。`}
        confirmText="移除"
        onConfirm={() => removeImage(removeImageIndex)}
      />

      <ConfirmDialog
        open={Boolean(removeId)}
        onOpenChange={(open) => !open && setRemoveId("")}
        title="刪除日常紀錄"
        description="確定要刪除這筆 Canis World 日常紀錄嗎？"
        confirmText="刪除"
        onConfirm={confirmDelete}
      />
    </DashboardShell>
  );
}
