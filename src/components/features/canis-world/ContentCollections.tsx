// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FilePenLine,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { IconCombobox } from "@/components/shared/IconCombobox";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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
  Field,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createCanisWorldCollectionItem,
  deleteCanisWorldCollectionItem,
  updateCanisWorldCollectionItem,
} from "@/services/canisWorldService";
import { getErrorMessage } from "@/utils/apiError";

const configs = {
  faq: {
    collection: "faqs",
    singular: "常見問題",
    title: "常見問題",
    description: "管理關於區塊的問題、回答與顯示順序。",
    empty: {
      question: "",
      answer: "",
      priority: 100,
      published: true,
      draft: false,
    },
  },
  feature: {
    collection: "feature-cards",
    singular: "資訊卡片",
    title: "資訊卡片",
    description: "管理首頁底部的資訊卡片，可依需要持續新增。",
    empty: {
      title: "",
      description: "",
      icon: "home",
      priority: 100,
      published: true,
      draft: false,
    },
  },
};

const iconNameSet = new Set(iconNames);

function IconCell({ name }) {
  const iconName = iconNameSet.has(name) ? name : "home";

  return (
    <span className="inline-flex items-center gap-2">
      <DynamicIcon name={iconName} className="size-4 text-muted-foreground" />
      <span>{iconName}</span>
    </span>
  );
}

const statusOptions = [
  { value: "all", label: "所有狀態" },
  { value: "published", label: "公開" },
  { value: "hidden", label: "隱藏" },
  { value: "draft", label: "草稿" },
];

const emptyCollectionFilters = {
  keyword: "",
  status: "all",
};

function filterCollectionItems(items, filters) {
  const keyword = String(filters.keyword || "")
    .trim()
    .toLowerCase();

  return items.filter((item) => {
    if (
      keyword &&
      ![item.question, item.answer, item.title, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    ) {
      return false;
    }

    const status = filters.status;
    if (status === "published") {
      return item.published !== false && item.draft !== true;
    }
    if (status === "hidden") {
      return item.published === false && item.draft !== true;
    }
    if (status === "draft") {
      return item.draft === true;
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

function selectedStatusLabel(value) {
  return (
    statusOptions.find((option) => option.value === value)?.label || "所有狀態"
  );
}

function CollectionFilters({
  idPrefix,
  keywordLabel,
  keywordPlaceholder,
  draftFilters,
  onChange,
  onApply,
  onReset,
}) {
  return (
    <Card aria-label={`${keywordLabel}篩選`}>
      <CardContent className="p-4 sm:p-6">
        <form className="grid gap-5" onSubmit={onApply}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-keyword-filter`}>
                {keywordLabel}
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id={`${idPrefix}-keyword-filter`}
                  value={draftFilters.keyword}
                  onChange={(event) =>
                    onChange({ ...draftFilters, keyword: event.target.value })
                  }
                  placeholder={keywordPlaceholder}
                />
              </InputGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}-status-filter`}>狀態</Label>
              <Select
                value={draftFilters.status}
                onValueChange={(value) =>
                  onChange({ ...draftFilters, status: value })
                }
              >
                <SelectTrigger
                  id={`${idPrefix}-status-filter`}
                  className="w-full"
                >
                  <SelectValue>
                    {selectedStatusLabel(draftFilters.status)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              onClick={onReset}
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
  );
}

function ActionButtons({ item, onEdit, onDelete, label }) {
  return (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`編輯${label}`}
            onClick={() => onEdit(item)}
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
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            aria-label={`刪除${label}`}
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>刪除</TooltipContent>
      </Tooltip>
    </div>
  );
}

function OrderButtons({ item, items, onMove, disabled, label }) {
  const index = items.findIndex((current) => current._id === item._id);

  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${label}往上移`}
            disabled={disabled || index <= 0}
            onClick={() => onMove(item, -1)}
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
            aria-label={`${label}往下移`}
            disabled={disabled || index < 0 || index >= items.length - 1}
            onClick={() => onMove(item, 1)}
          >
            <ArrowDown className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>往下移</TooltipContent>
      </Tooltip>
    </div>
  );
}

function stripMeta(item) {
  const { _id, createdAt, updatedAt, ...payload } = item;
  return payload;
}

export function ContentCollections({
  faqs,
  featureCards,
  onChanged,
  activeSection,
}) {
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState({});
  const [removeTarget, setRemoveTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [faqDraftFilters, setFaqDraftFilters] = useState(
    emptyCollectionFilters,
  );
  const [faqAppliedFilters, setFaqAppliedFilters] = useState(
    emptyCollectionFilters,
  );
  const [featureDraftFilters, setFeatureDraftFilters] = useState(
    emptyCollectionFilters,
  );
  const [featureAppliedFilters, setFeatureAppliedFilters] = useState(
    emptyCollectionFilters,
  );
  const editorFormRef = useRef(null);
  const saveIntentRef = useRef("save");

  useEffect(() => {
    if (!editor) return;

    function handleSaveShortcut(event) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s")
        return;
      event.preventDefault();
      event.stopPropagation();
      if (!saving) editorFormRef.current?.requestSubmit();
    }

    document.addEventListener("keydown", handleSaveShortcut, true);
    return () =>
      document.removeEventListener("keydown", handleSaveShortcut, true);
  }, [editor, saving]);

  function openCreate(type, items) {
    const config = configs[type];
    const nextPriority = items.length
      ? Math.max(...items.map((item) => Number(item.priority) || 0)) + 1
      : 1;
    setDraft({ ...config.empty, priority: nextPriority });
    setEditor({ type, id: "" });
  }

  function openEdit(type, item) {
    setDraft({ ...configs[type].empty, ...item });
    setEditor({ type, id: item._id });
  }

  async function saveItem(event) {
    event.preventDefault();
    if (!editor) return;
    const config = configs[editor.type];
    const { _id, createdAt, updatedAt, ...values } = draft;
    const asDraft = saveIntentRef.current === "draft";
    saveIntentRef.current = "save";
    const payload = {
      ...values,
      priority: Number(values.priority) || 0,
      draft: asDraft ? true : false,
      published: asDraft ? false : values.published !== false,
    };
    setSaving(true);
    try {
      const result = editor.id
        ? await updateCanisWorldCollectionItem(
            config.collection,
            editor.id,
            payload,
          )
        : await createCanisWorldCollectionItem(config.collection, payload);
      toast.success(
        result.message || `${config.singular}${asDraft ? "草稿" : ""}已儲存`,
      );
      setEditor(null);
      await onChanged();
    } catch (error) {
      toast.error(getErrorMessage(error, `${config.singular}儲存失敗`));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!removeTarget) return;
    const config = configs[removeTarget.type];
    setSaving(true);
    try {
      const result = await deleteCanisWorldCollectionItem(
        config.collection,
        removeTarget.id,
      );
      toast.success(result.message || `${config.singular}已刪除`);
      setRemoveTarget(null);
      await onChanged();
    } catch (error) {
      toast.error(getErrorMessage(error, `${config.singular}刪除失敗`));
    } finally {
      setSaving(false);
    }
  }

  const sortedFaqs = [...faqs].sort(
    (a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0),
  );
  const sortedFeatureCards = [...featureCards].sort(
    (a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0),
  );
  const filteredFaqs = filterCollectionItems(sortedFaqs, faqAppliedFilters);
  const filteredFeatureCards = filterCollectionItems(
    sortedFeatureCards,
    featureAppliedFilters,
  );

  function applyFaqFilters(event) {
    event.preventDefault();
    setFaqAppliedFilters(faqDraftFilters);
  }

  function resetFaqFilters() {
    setFaqDraftFilters(emptyCollectionFilters);
    setFaqAppliedFilters(emptyCollectionFilters);
  }

  function applyFeatureFilters(event) {
    event.preventDefault();
    setFeatureAppliedFilters(featureDraftFilters);
  }

  function resetFeatureFilters() {
    setFeatureDraftFilters(emptyCollectionFilters);
    setFeatureAppliedFilters(emptyCollectionFilters);
  }

  async function moveCollectionItem(type, item, direction, visibleItems) {
    const config = configs[type];
    const items =
      visibleItems || (type === "faq" ? sortedFaqs : sortedFeatureCards);
    const index = items.findIndex((current) => current._id === item._id);
    const target = items[index + direction];
    if (index < 0 || !target) return;

    const currentPriority = Number(item.priority) || index + 1;
    const targetPriority = Number(target.priority) || index + direction + 1;

    setSaving(true);
    try {
      await Promise.all([
        updateCanisWorldCollectionItem(config.collection, item._id, {
          ...stripMeta(item),
          priority: targetPriority,
        }),
        updateCanisWorldCollectionItem(config.collection, target._id, {
          ...stripMeta(target),
          priority: currentPriority,
        }),
      ]);
      toast.success(`${config.singular}排序已更新`);
      await onChanged();
    } catch (error) {
      toast.error(getErrorMessage(error, `${config.singular}排序更新失敗`));
    } finally {
      setSaving(false);
    }
  }

  const faqColumns = useMemo(
    () => [
      {
        accessorKey: "question",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="問題" />
        ),
        cell: ({ row }) => (
          <div className="max-w-xl">
            <div className="font-medium">
              {row.original.question || "未命名草稿"}
            </div>
            <div className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.answer || "尚未填寫回答"}
            </div>
          </div>
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
            <OrderButtons
              item={row.original}
              items={filteredFaqs}
              label="常見問題"
              disabled={saving}
              onMove={(item, direction) =>
                moveCollectionItem("faq", item, direction, filteredFaqs)
              }
            />
            <ActionButtons
              item={row.original}
              label="常見問題"
              onEdit={(item) => openEdit("faq", item)}
              onDelete={(item) =>
                setRemoveTarget({
                  type: "faq",
                  id: item._id,
                  name: item.question,
                })
              }
            />
          </div>
        ),
      },
    ],
    [filteredFaqs, saving],
  );

  const featureColumns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="標題" />
        ),
        cell: ({ row }) => (
          <div className="max-w-xl">
            <div className="font-medium">
              {row.original.title || "未命名草稿"}
            </div>
            <div className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.description || "尚未填寫說明"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "icon",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="圖示" />
        ),
        cell: ({ row }) => <IconCell name={row.original.icon || "home"} />,
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
            <OrderButtons
              item={row.original}
              items={filteredFeatureCards}
              label="資訊卡片"
              disabled={saving}
              onMove={(item, direction) =>
                moveCollectionItem(
                  "feature",
                  item,
                  direction,
                  filteredFeatureCards,
                )
              }
            />
            <ActionButtons
              item={row.original}
              label="資訊卡片"
              onEdit={(item) => openEdit("feature", item)}
              onDelete={(item) =>
                setRemoveTarget({
                  type: "feature",
                  id: item._id,
                  name: item.title,
                })
              }
            />
          </div>
        ),
      },
    ],
    [filteredFeatureCards, saving],
  );

  const activeConfig = editor ? configs[editor.type] : null;

  return (
    <>
      <div className={`grid gap-6 ${activeSection !== "faqs" ? "hidden" : ""}`}>
        <CollectionFilters
          idPrefix="faq"
          keywordLabel="問題"
          keywordPlaceholder="搜尋問題或回答"
          draftFilters={faqDraftFilters}
          onChange={setFaqDraftFilters}
          onApply={applyFaqFilters}
          onReset={resetFaqFilters}
        />
        <Card className="overflow-hidden">
          <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>{configs.faq.title}</CardTitle>
              <CardDescription>{configs.faq.description}</CardDescription>
            </div>
            <Button
              type="button"
              className="self-start"
              onClick={() => openCreate("faq", faqs)}
            >
              <Plus className="size-4" />
              新增問題
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={faqColumns}
              data={filteredFaqs}
              enableSorting={false}
              pageSize={10}
              emptyText="尚未建立常見問題"
              emptyDescription="調整篩選或新增問題後會出現在這裡。"
            />
          </CardContent>
        </Card>
      </div>

      <div
        className={`grid gap-6 ${activeSection !== "features" ? "hidden" : ""}`}
      >
        <CollectionFilters
          idPrefix="feature"
          keywordLabel="標題"
          keywordPlaceholder="搜尋標題或說明"
          draftFilters={featureDraftFilters}
          onChange={setFeatureDraftFilters}
          onApply={applyFeatureFilters}
          onReset={resetFeatureFilters}
        />
        <Card className="overflow-hidden">
          <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-1.5">
              <CardTitle>{configs.feature.title}</CardTitle>
              <CardDescription>{configs.feature.description}</CardDescription>
            </div>
            <Button
              type="button"
              className="self-start"
              onClick={() => openCreate("feature", featureCards)}
            >
              <Plus className="size-4" />
              新增卡片
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={featureColumns}
              data={filteredFeatureCards}
              enableSorting={false}
              pageSize={10}
              emptyText="尚未建立資訊卡片"
              emptyDescription="調整篩選或新增卡片後會出現在這裡。"
            />
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(null)}
      >
        <DialogContent className="grid max-h-[calc(100svh-2rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              {editor?.id ? "編輯" : "新增"}
              {activeConfig?.singular}
            </DialogTitle>
            <DialogDescription>
              公開項目會同步到 canis.world；隱藏與草稿只保留在後台。
            </DialogDescription>
          </DialogHeader>
          <form
            ref={editorFormRef}
            onSubmit={saveItem}
            className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden"
          >
            <div className="grid min-h-0 gap-4 overflow-y-auto px-6 py-5">
              {editor?.type === "faq" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="faq-question">問題</Label>
                    <Input
                      id="faq-question"
                      placeholder="例如：Canis World 會更新哪些內容？"
                      value={draft.question || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, question: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="faq-answer">回答</Label>
                    <Textarea
                      id="faq-answer"
                      placeholder="請輸入問題的回答"
                      value={draft.answer || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, answer: event.target.value })
                      }
                      className="min-h-32"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="feature-title">標題</Label>
                    <Input
                      id="feature-title"
                      placeholder="例如：日常紀錄"
                      value={draft.title || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feature-description">說明</Label>
                    <Textarea
                      id="feature-description"
                      placeholder="請輸入資訊卡片說明"
                      value={draft.description || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                      }
                      className="min-h-28"
                      required
                    />
                  </div>
                </>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {editor?.type === "feature" ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="feature-icon">圖示</Label>
                      <IconCombobox
                        id="feature-icon"
                        value={draft.icon || "home"}
                        onValueChange={(value) =>
                          setDraft({ ...draft, icon: value })
                        }
                        placeholder="搜尋圖示關鍵字"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="collection-priority">排序</Label>
                      <Input
                        id="collection-priority"
                        type="number"
                        value={draft.priority ?? 100}
                        onChange={(event) =>
                          setDraft({ ...draft, priority: event.target.value })
                        }
                      />
                    </div>
                  </>
                ) : null}
                <FieldLabel className="cursor-pointer rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-muted/30 md:col-span-2">
                  <Field className="grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <Checkbox
                      checked={draft.published !== false}
                      onCheckedChange={(checked) =>
                        setDraft({ ...draft, published: checked === true })
                      }
                    />
                    <FieldContent>
                      <span className="text-sm font-medium">公開顯示</span>
                      <FieldDescription>
                        勾選後會顯示在 canis.world；關閉時會標記為隱藏。
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              </div>
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={saving}>
                  取消
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="secondary"
                disabled={saving || draft.published !== false}
                formNoValidate
                onClick={() => {
                  saveIntentRef.current = "draft";
                }}
              >
                <FilePenLine className="size-4" />
                存為草稿
              </Button>
              <Button
                type="submit"
                disabled={saving}
                onClick={() => {
                  saveIntentRef.current = "save";
                }}
              >
                {saving ? "儲存中..." : "儲存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`刪除${removeTarget ? configs[removeTarget.type].singular : "項目"}`}
        description={`確定要刪除「${removeTarget?.name || ""}」嗎？`}
        confirmText="刪除"
        onConfirm={confirmDelete}
      />
    </>
  );
}
