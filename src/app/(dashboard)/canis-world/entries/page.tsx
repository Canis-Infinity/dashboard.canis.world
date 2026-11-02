// @ts-nocheck
"use client";
import { formatDisplayDate } from "@/utils/date";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  FilePenLine,
  ImageIcon,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
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
  uploadCanisWorldMedia,
} from "@/services/canisWorldService";
import { apiAssetUrl } from "@/libs/url";
import { getErrorMessage } from "@/utils/apiError";

const emptyEntry = {
  title: "",
  excerpt: "",
  content: "",
  category: "出遊",
  mood: "",
  occurredAt: "",
  tags: [],
  images: [],
  featured: false,
  published: true,
  draft: false,
  priority: 100,
};

const MAX_FEATURED_ENTRIES = 5;

function currentDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const baseCategoryOptions = [
  "日常",
  "出遊",
  "基地生活",
  "照片",
  "創作",
  "活動",
  "紀錄",
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

const publicationFilters = [
  { value: "all", label: "所有狀態" },
  { value: "published", label: "公開" },
  { value: "hidden", label: "隱藏" },
  { value: "draft", label: "草稿" },
];

const featuredFilters = [
  { value: "all", label: "全部" },
  { value: "featured", label: "精選" },
  { value: "normal", label: "一般" },
];

function getCanisWorldPublicUrl() {
  if (process.env.NEXT_PUBLIC_CANIS_WORLD_URL) {
    return process.env.NEXT_PUBLIC_CANIS_WORLD_URL;
  }

  if (
    typeof window !== "undefined" &&
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    return `${window.location.protocol}//${window.location.hostname}:7654`;
  }

  return "https://canis.world";
}

const emptyEntryFilters = {
  title: "",
  dateRange: { from: undefined, to: undefined },
  category: "all",
  featured: "all",
  status: "all",
};

function selectedOptionLabel(options, value, fallback) {
  return options.find((option) => option.value === value)?.label || fallback;
}

function filterEntries(items, filters) {
  const title = String(filters.title || "")
    .trim()
    .toLowerCase();

  return items.filter((entry) => {
    if (
      title &&
      !String(entry.title || "")
        .toLowerCase()
        .includes(title)
    ) {
      return false;
    }

    if (filters.dateRange?.from) {
      const occurredAt = new Date(entry.occurredAt);
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to || filters.dateRange.from);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      if (
        Number.isNaN(occurredAt.getTime()) ||
        occurredAt < from ||
        occurredAt > to
      ) {
        return false;
      }
    }

    if (filters.category !== "all" && entry.category !== filters.category) {
      return false;
    }

    if (filters.featured === "featured" && entry.featured !== true) {
      return false;
    }
    if (filters.featured === "normal" && entry.featured === true) {
      return false;
    }

    if (
      filters.status === "published" &&
      (entry.published === false || entry.draft === true)
    ) {
      return false;
    }
    if (
      filters.status === "hidden" &&
      (entry.published !== false || entry.draft === true)
    ) {
      return false;
    }
    if (filters.status === "draft" && entry.draft !== true) {
      return false;
    }

    return true;
  });
}

function publicationState(item) {
  if (item.draft === true) return "draft";
  if (item.published === false) return "hidden";
  return "published";
}

function PublicationBadge({ item }) {
  const state = publicationState(item);
  const labels = {
    published: "公開",
    hidden: "隱藏",
    draft: "草稿",
  };

  return (
    <Badge variant={state === "published" ? "default" : "secondary"}>
      {labels[state]}
    </Badge>
  );
}

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
  if (path.startsWith("/uploads/")) return apiAssetUrl(path);
  if (path.startsWith("/daily/")) return `${getCanisWorldPublicUrl()}${path}`;
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

function uniqueOptions(baseOptions, entries, key, excludedOptions = []) {
  const excluded = new Set(
    excludedOptions.map((option) => String(option).toLowerCase()),
  );

  return Array.from(
    new Set([
      ...baseOptions,
      ...entries.map((entry) => entry?.[key]).filter(Boolean),
    ]),
  ).filter((option) => !excluded.has(String(option).toLowerCase()));
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) {
  const resolvedPlaceholder =
    placeholder ??
    (type === "date"
      ? undefined
      : `請輸入${String(label).replace("，逗號分隔", "")}`);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        placeholder={resolvedPlaceholder}
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
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  function commitCustomValue() {
    const nextValue = inputValue.trim();
    if (nextValue !== (value || "")) onChange(nextValue);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Combobox
        items={options}
        value={value || null}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        onValueChange={(nextValue) => {
          if (!nextValue) return;
          setInputValue(nextValue);
          onChange(nextValue);
        }}
        autoHighlight
      >
        <ComboboxInput
          id={id}
          placeholder={placeholder}
          onBlur={commitCustomValue}
        />
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
    <div className="grid gap-4" aria-label="日常紀錄載入中">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default function EntriesPage() {
  const fetchData = useCallback(() => getCanisWorldAdmin(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchData, [], {
    initialData: null,
    fallbackError: "無法取得 Canis World 資料",
  });
  const [entries, setEntries] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(normalizeEntry());
  const [editingId, setEditingId] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [featuredLimitOpen, setFeaturedLimitOpen] = useState(false);
  const [removeImageIndex, setRemoveImageIndex] = useState(null);
  const [mutating, setMutating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [entryDraftFilters, setEntryDraftFilters] = useState(emptyEntryFilters);
  const [entryAppliedFilters, setEntryAppliedFilters] =
    useState(emptyEntryFilters);
  const editorFormRef = useRef(null);
  const mediaUploadInputRef = useRef(null);
  const entrySaveIntentRef = useRef("save");

  useEffect(() => {
    if (!data) return;
    setEntries(data.entries || []);
  }, [data]);

  useEffect(() => {
    function handleSaveShortcut(event) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s")
        return;
      event.preventDefault();
      if (mutating || uploadingImages) return;

      const form = editorOpen ? editorFormRef.current : null;
      form?.requestSubmit();
    }

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [editorOpen, mutating, uploadingImages]);

  function openCreate() {
    const nextPriority = entries.length
      ? Math.max(...entries.map((item) => Number(item.priority) || 0)) + 1
      : 1;
    setEditingId("");
    setRemoveImageIndex(null);
    setDraft(
      normalizeEntry({
        ...emptyEntry,
        occurredAt: currentDateValue(),
        priority: nextPriority,
      }),
    );
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
    setUploadingImages(true);
    setUploadProgress(0);
    try {
      const result = await uploadCanisWorldMedia(files, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            setUploadProgress((current) => Math.max(current, 15));
            return;
          }

          setUploadProgress(
            Math.round((progressEvent.loaded / progressEvent.total) * 100),
          );
        },
      });
      const paths = result.data.map((item) => item.path);
      setDraft((current) => ({
        ...current,
        images: [...(current.images || []), ...paths],
      }));
      setUploadProgress(100);
      toast.success(result.message || "圖片上傳成功");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError, "圖片上傳失敗"));
    } finally {
      event.target.value = "";
      window.setTimeout(() => {
        setUploadingImages(false);
        setUploadProgress(0);
      }, 350);
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
    const featuredCount = entries.filter(
      (entry) => entry.featured === true && entry._id !== editingId,
    ).length;
    if (draft.featured && featuredCount >= MAX_FEATURED_ENTRIES) {
      setFeaturedLimitOpen(true);
      return;
    }

    setMutating(true);
    try {
      const { _id, tagsText, ...fields } = draft;
      const asDraft = entrySaveIntentRef.current === "draft";
      entrySaveIntentRef.current = "save";
      const payload = {
        ...fields,
        tags: splitList(tagsText),
        images: draft.images || [],
        priority: Number(draft.priority) || 0,
        draft: asDraft ? true : false,
        published: asDraft ? false : fields.published !== false,
      };
      const result = editingId
        ? await updateCanisWorldEntry(editingId, payload)
        : await createCanisWorldEntry(payload);
      toast.success(result.message || `日常紀錄${asDraft ? "草稿" : ""}已儲存`);
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
  const filteredEntries = useMemo(
    () => filterEntries(sortedEntries, entryAppliedFilters),
    [entryAppliedFilters, sortedEntries],
  );

  function updateEntryDraftFilter(key, value) {
    setEntryDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyEntryFilters(event) {
    event.preventDefault();
    setEntryAppliedFilters(entryDraftFilters);
  }

  function resetEntryFilters() {
    setEntryDraftFilters(emptyEntryFilters);
    setEntryAppliedFilters(emptyEntryFilters);
  }
  async function moveEntry(entry, direction, visibleEntries = sortedEntries) {
    const index = visibleEntries.findIndex(
      (current) => current._id === entry._id,
    );
    const target = visibleEntries[index + direction];
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

  async function toggleFeatured(entry) {
    const nextFeatured = entry.featured !== true;
    const featuredCount = entries.filter(
      (current) => current.featured === true && current._id !== entry._id,
    ).length;

    if (nextFeatured && featuredCount >= MAX_FEATURED_ENTRIES) {
      setFeaturedLimitOpen(true);
      return;
    }

    setMutating(true);
    try {
      const result = await updateCanisWorldEntry(entry._id, {
        ...stripEntryMeta(entry),
        featured: nextFeatured,
      });
      toast.success(
        result.message || (nextFeatured ? "已設為精選" : "已取消精選"),
      );
      await refetch();
    } catch (featuredError) {
      toast.error(getErrorMessage(featuredError, "精選狀態更新失敗"));
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
          <div className="w-[30em]">
            <div
              className="truncate font-medium"
              title={row.original.title || "未命名草稿"}
            >
              {row.original.title || "未命名草稿"}
            </div>
            <div
              className="truncate text-xs text-muted-foreground"
              title={row.original.excerpt || "尚未填寫摘要"}
            >
              {row.original.excerpt || "尚未填寫摘要"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "occurredAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="日期" />
        ),
        cell: ({ row }) => formatDisplayDate(row.original.occurredAt),
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
        cell: ({ row }) => <PublicationBadge item={row.original} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <div className="text-right">動作</div>,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <EntryOrderButtons
              entry={row.original}
              entries={filteredEntries}
              disabled={mutating}
              onMove={(entry, direction) =>
                moveEntry(entry, direction, filteredEntries)
              }
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={
                    row.original.featured
                      ? "text-amber-400 hover:text-amber-400"
                      : undefined
                  }
                  disabled={mutating}
                  aria-label={row.original.featured ? "取消精選" : "設為精選"}
                  aria-pressed={row.original.featured === true}
                  onClick={() => toggleFeatured(row.original)}
                >
                  <Star
                    className={
                      row.original.featured ? "size-4 fill-current" : "size-4"
                    }
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.featured ? "取消精選" : "設為精選"}
              </TooltipContent>
            </Tooltip>
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
    [entries, filteredEntries, mutating],
  );

  const categoryOptions = useMemo(
    () => uniqueOptions(baseCategoryOptions, entries, "category", ["daily"]),
    [entries],
  );
  const moodOptions = useMemo(
    () => uniqueOptions(baseMoodOptions, entries, "mood"),
    [entries],
  );
  return (
    <DashboardShell
      title="日常紀錄"
      description="管理日常文字、照片、精選與公開狀態。"
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
      {loading || !data ? (
        <CanisWorldSkeleton />
      ) : (
        <>
          <div className="grid gap-6">
            <Card aria-label="日常紀錄篩選">
              <CardContent className="p-4 sm:p-6">
                <form className="grid gap-5" onSubmit={applyEntryFilters}>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
                    <div className="grid gap-2 xl:col-span-3">
                      <Label htmlFor="entry-title-filter">標題</Label>
                      <InputGroup>
                        <InputGroupAddon>
                          <Search />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="entry-title-filter"
                          value={entryDraftFilters.title}
                          onChange={(event) =>
                            updateEntryDraftFilter("title", event.target.value)
                          }
                          placeholder="搜尋標題"
                        />
                      </InputGroup>
                    </div>

                    <DateRangePicker
                      id="entry-date-range-filter"
                      label="日期"
                      value={entryDraftFilters.dateRange}
                      onChange={(value) =>
                        updateEntryDraftFilter("dateRange", value)
                      }
                      includeHiddenInputs={false}
                      numberOfMonths={2}
                      className="xl:col-span-3"
                    />

                    <div className="grid gap-2 xl:col-span-2">
                      <Label htmlFor="entry-category-filter">分類</Label>
                      <Select
                        value={entryDraftFilters.category}
                        onValueChange={(value) =>
                          updateEntryDraftFilter("category", value)
                        }
                      >
                        <SelectTrigger
                          id="entry-category-filter"
                          className="w-full"
                        >
                          <SelectValue>
                            {entryDraftFilters.category === "all"
                              ? "所有分類"
                              : entryDraftFilters.category}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有分類</SelectItem>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2 xl:col-span-2">
                      <Label htmlFor="entry-featured-filter">精選</Label>
                      <Select
                        value={entryDraftFilters.featured}
                        onValueChange={(value) =>
                          updateEntryDraftFilter("featured", value)
                        }
                      >
                        <SelectTrigger
                          id="entry-featured-filter"
                          className="w-full"
                        >
                          <SelectValue>
                            {selectedOptionLabel(
                              featuredFilters,
                              entryDraftFilters.featured,
                              "全部",
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {featuredFilters.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                              {filter.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2 xl:col-span-2">
                      <Label htmlFor="entry-status-filter">狀態</Label>
                      <Select
                        value={entryDraftFilters.status}
                        onValueChange={(value) =>
                          updateEntryDraftFilter("status", value)
                        }
                      >
                        <SelectTrigger
                          id="entry-status-filter"
                          className="w-full"
                        >
                          <SelectValue>
                            {selectedOptionLabel(
                              publicationFilters,
                              entryDraftFilters.status,
                              "所有狀態",
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {publicationFilters.map((filter) => (
                            <SelectItem key={filter.value} value={filter.value}>
                              {filter.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 sm:min-w-24"
                      onClick={resetEntryFilters}
                    >
                      <RotateCcw className="size-4" />
                      重設
                    </Button>
                    <Button type="submit" className="h-9 sm:min-w-28">
                      <Search className="size-4" />
                      套用篩選
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="gap-1.5 space-y-0">
                <CardTitle>日常紀錄</CardTitle>
                <CardDescription>
                  公開後會同步顯示在 canis.world；隱藏與草稿只保留在後台。
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={filteredEntries}
                  enableSorting={false}
                  pageSize={10}
                  emptyText="尚未建立日常紀錄"
                  emptyDescription="調整篩選或新增日常後會出現在這裡。"
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="grid h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 max-sm:left-0 max-sm:top-0 max-sm:h-svh max-sm:max-h-svh max-sm:w-screen max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0">
          <DialogHeader className="min-w-0 px-4 pt-4 pr-12 text-left sm:px-6 sm:pt-6">
            <DialogTitle>{editingId ? "編輯日常" : "新增日常"}</DialogTitle>
            <DialogDescription className="text-pretty">
              管理日常文字、分類、照片與公開、隱藏或草稿狀態。
            </DialogDescription>
          </DialogHeader>
          <form
            ref={editorFormRef}
            onSubmit={applyDraft}
            className="grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden"
          >
            <div className="grid min-h-0 min-w-0 gap-5 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field
                  id="entry-title"
                  label="標題"
                  value={draft.title}
                  onChange={(value) => setDraft({ ...draft, title: value })}
                  required
                />
                <DatePicker
                  id="entry-date"
                  label="日期"
                  value={draft.occurredAt}
                  onChange={(value) =>
                    setDraft({ ...draft, occurredAt: value })
                  }
                  required
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
                <div className="lg:col-span-2">
                  <Field
                    id="entry-tags"
                    label="標籤，逗號分隔"
                    placeholder="例如：出遊, 朋友, 基地生活"
                    value={draft.tagsText}
                    onChange={(value) =>
                      setDraft({ ...draft, tagsText: value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry-excerpt">摘要</Label>
                <Textarea
                  id="entry-excerpt"
                  placeholder="請輸入日常摘要"
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
                  placeholder="請輸入完整日常內容"
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
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <Image
                            src={resolveImagePreview(path)}
                            alt={`${draft.title || "日常"}的第 ${index + 1} 張照片`}
                            fill
                            sizes="(min-width: 1024px) 260px, (min-width: 640px) 528px, calc(100vw - 32px)"
                            loading="lazy"
                            className="object-cover"
                          />
                          <Badge
                            className="relative z-10 m-2 bg-background/85 text-foreground backdrop-blur-sm"
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
                                disabled={
                                  index === 0 || mutating || uploadingImages
                                }
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
                                  index === draft.images.length - 1 ||
                                  mutating ||
                                  uploadingImages
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
                                disabled={mutating || uploadingImages}
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
                    type="button"
                    variant="outline"
                    disabled={mutating || uploadingImages}
                    className="w-full sm:w-fit"
                    onClick={() => mediaUploadInputRef.current?.click()}
                  >
                    {uploadingImages ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                    {uploadingImages
                      ? "上傳中"
                      : draft.images?.length
                        ? "新增照片"
                        : "選擇照片"}
                  </Button>
                  <span className="min-w-0 text-xs leading-5 text-muted-foreground">
                    可一次選取多張，上方順序會同步到前台。
                  </span>
                  <Input
                    ref={mediaUploadInputRef}
                    id="media-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="sr-only"
                    disabled={mutating || uploadingImages}
                    onChange={uploadImages}
                  />
                </div>
                {uploadingImages ? (
                  <Progress value={uploadProgress}>
                    <ProgressLabel>圖片上傳進度</ProgressLabel>
                    <ProgressValue>{() => `${uploadProgress}%`}</ProgressValue>
                  </Progress>
                ) : null}
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
                        最多可設定 {MAX_FEATURED_ENTRIES}{" "}
                        篇，會出現在首頁的精選日常區塊；未勾選仍會保留在所有貼文與資料表。
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
                        勾選後會同步顯示在 canis.world；關閉時會標記為隱藏。
                      </FieldDescription>
                    </FieldContent>
                  </CheckboxField>
                </FieldLabel>
              </div>
            </div>
            <DialogFooter className="m-0 rounded-none border-t px-4 py-4 sm:px-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutating || uploadingImages}
                >
                  取消
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="secondary"
                disabled={
                  mutating || uploadingImages || draft.published !== false
                }
                formNoValidate
                onClick={() => {
                  entrySaveIntentRef.current = "draft";
                }}
              >
                <FilePenLine className="size-4" />
                存為草稿
              </Button>
              <Button
                type="submit"
                disabled={mutating || uploadingImages}
                onClick={() => {
                  entrySaveIntentRef.current = "save";
                }}
              >
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

      <AlertDialog open={featuredLimitOpen} onOpenChange={setFeaturedLimitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>精選數量已達上限</AlertDialogTitle>
            <AlertDialogDescription>
              首頁最多顯示 {MAX_FEATURED_ENTRIES}{" "}
              筆精選日常。請先取消一筆精選，再設定新的精選項目。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>了解</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
