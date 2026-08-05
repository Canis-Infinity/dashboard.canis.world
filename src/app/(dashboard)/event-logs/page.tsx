// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Eye, ListChecks, RotateCcw, Search } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useEventLogs } from '@/hooks/useEventLogs';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getActor(log) {
  return log.actor?.username || log.actor?.name || log.user || '-';
}

function getModule(log) {
  return log.module || log.resource || '-';
}

function getTarget(log) {
  return log.target || log.path || log.url || log.requestId || '-';
}

const resourceLabels = {
  profile: '個人資料',
  contact: '聯絡表單',
  contacts: '聯絡表單',
  event: '事件紀錄',
  'event-logs': '事件紀錄',
  login: '登入',
  logout: '登出',
  auth: '帳號驗證',
  visit: '訪客紀錄',
  visits: '訪客紀錄',
};

function getRequestPath(log) {
  if (log.path || log.url) return log.path || log.url;
  const match = String(log.message || '').match(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)/i);
  return match?.[1] || '';
}

function shortenId(value) {
  if (!value) return '';
  const text = String(value);
  if (text.length <= 12) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function getResourceLabel(value) {
  const key = String(value || '').toLowerCase();
  return resourceLabels[key] || value || '目標';
}

function getTargetSummary(log) {
  const requestPath = getRequestPath(log);
  const cleanPath = requestPath.split('?')[0].replace(/^https?:\/\/[^/]+/i, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const apiIndex = segments.indexOf('api');
  const resource = segments[apiIndex >= 0 ? apiIndex + 1 : 0] || getModule(log);
  const resourceId = segments[apiIndex >= 0 ? apiIndex + 2 : 1] || log.resourceId;
  const label = getResourceLabel(resource);

  return {
    title: resourceId ? `${label} ${shortenId(resourceId)}` : label,
    subtitle: requestPath || getMessage(log),
  };
}

function getMethod(log) {
  return String(log.metadata?.httpMethod || log.method || log.action || '-').toUpperCase();
}

function getMessage(log) {
  if (log.message) return log.message;
  const actor = getActor(log);
  return log.status === 'failed' ? `${actor} 操作失敗。` : `${actor} 成功新增或執行。`;
}

function getStatusLabel(status) {
  return status === 'failed' ? '失敗' : '成功';
}

const statusBadgeClassNames = {
  success: 'border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  failed: 'border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const statusOptions = [
  { value: 'all', label: '所有結果' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失敗' },
];

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const emptyFilters = {
  type: 'all',
  keyword: '',
  module: 'all',
  method: 'all',
  dateRange: { from: undefined, to: undefined },
};

function EventLogsContent() {
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [selectedLog, setSelectedLog] = useState(null);
  const { data, total, amount, loading, error } = useEventLogs({
    page,
    type: appliedFilters.type,
    keyword: appliedFilters.keyword,
  });
  const totalPages = total || 1;

  const moduleOptions = useMemo(() => {
    const values = Array.from(new Set(data.map(getModule).filter((value) => value && value !== '-')));
    return values.sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((log) => {
      if (appliedFilters.module !== 'all' && getModule(log) !== appliedFilters.module) return false;
      if (appliedFilters.method !== 'all' && getMethod(log) !== appliedFilters.method) return false;
      if (appliedFilters.dateRange.from) {
        const created = dayjs(log.createdAt);
        const from = dayjs(appliedFilters.dateRange.from).startOf('day');
        const to = dayjs(appliedFilters.dateRange.to || appliedFilters.dateRange.from).endOf('day');
        if (!created.isValid() || created.isBefore(from) || created.isAfter(to)) return false;
      }
      return true;
    });
  }, [appliedFilters, data]);

  const hasLocalFilter = appliedFilters.module !== 'all' || appliedFilters.method !== 'all' || Boolean(appliedFilters.dateRange.from);
  const columns = useMemo(() => [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="時間" />,
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actor',
      accessorFn: getActor,
      header: ({ column }) => <DataTableColumnHeader column={column} title="操作者" />,
    },
    {
      id: 'module',
      accessorFn: getModule,
      header: ({ column }) => <DataTableColumnHeader column={column} title="模組" />,
    },
    {
      id: 'target',
      accessorFn: (log) => getTargetSummary(log).title,
      header: ({ column }) => <DataTableColumnHeader column={column} title="目標" />,
      meta: { cellClassName: 'max-w-[18rem]' },
      cell: ({ row }) => <TargetCell log={row.original} />,
    },
    {
      id: 'message',
      accessorFn: getMessage,
      header: ({ column }) => <DataTableColumnHeader column={column} title="訊息" />,
      meta: { cellClassName: 'max-w-[24rem] truncate' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="狀態" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={statusBadgeClassNames[row.original.status] || statusBadgeClassNames.success}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <div className="text-right">操作</div>,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="mx-0 ml-auto"
              aria-label="查看詳情"
              onClick={() => setSelectedLog(row.original)}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>查看詳情</TooltipContent>
        </Tooltip>
      ),
    },
  ], []);

  function updateDraftFilter(key, value) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event) {
    event?.preventDefault();
    setPage(1);
    setAppliedFilters(draftFilters);
  }

  function resetFilters() {
    setPage(1);
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  }

  return (
    <DashboardShell title="事件紀錄" description="查詢後台重要操作、登入紀錄與稽核資訊。">
      <div className="flex items-start gap-3">
        <ListChecks className="mt-1 size-7 text-muted-foreground" />
        <div className="grid gap-1">
          <h2 className="text-xl font-semibold">操作紀錄</h2>
          <p className="text-sm text-muted-foreground">查詢系統重要操作、登入紀錄與稽核資訊。</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <form className="grid gap-5 p-5" onSubmit={applyFilters}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DateRangePicker
              id="event-date-range-filter"
              label="日期區間"
              value={draftFilters.dateRange}
              onChange={(value) => updateDraftFilter('dateRange', value)}
              includeHiddenInputs={false}
              numberOfMonths={2}
              className="md:col-span-2"
            />

            <Field>
              <Label htmlFor="event-status-filter">狀態</Label>
              <FieldContent>
                <Select
                  value={draftFilters.type}
                  onValueChange={(value) => updateDraftFilter('type', value)}
                >
                  <SelectTrigger id="event-status-filter" className="w-full">
                    <SelectValue>{statusOptions.find((item) => item.value === draftFilters.type)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <Label htmlFor="event-module-filter">模組</Label>
              <FieldContent>
                <Select value={draftFilters.module} onValueChange={(value) => updateDraftFilter('module', value)}>
                  <SelectTrigger id="event-module-filter" className="w-full">
                    <SelectValue>{draftFilters.module === 'all' ? '所有模組' : draftFilters.module}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有模組</SelectItem>
                    {moduleOptions.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <Label htmlFor="event-method-filter">HTTP 方法</Label>
              <FieldContent>
                <Select value={draftFilters.method} onValueChange={(value) => updateDraftFilter('method', value)}>
                  <SelectTrigger id="event-method-filter" className="w-full">
                    <SelectValue>{draftFilters.method === 'all' ? '所有方法' : draftFilters.method}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有方法</SelectItem>
                    {methodOptions.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field className="md:col-span-2 xl:col-span-3">
              <Label htmlFor="event-log-search">搜尋</Label>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="event-log-search"
                    value={draftFilters.keyword}
                    onChange={(event) => updateDraftFilter('keyword', event.target.value)}
                    placeholder="搜尋操作者、路徑、動作、模組、目標"
                  />
                </InputGroup>
              </FieldContent>
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-9 sm:min-w-24" onClick={resetFilters}>
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
        <CardContent className="p-0">
          {error ? <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyText="沒有符合條件的事件紀錄"
            pageSize={10}
            initialSorting={[{ id: 'createdAt', desc: true }]}
            {...(hasLocalFilter
              ? { totalRows: filteredData.length }
              : {
                  pageIndex: page - 1,
                  pageCount: totalPages,
                  totalRows: amount,
                  onPageChange: (nextPageIndex) => setPage(nextPageIndex + 1),
                })}
          />
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 px-6 pb-4 pt-6">
            <DialogTitle>事件詳細資訊</DialogTitle>
            <DialogDescription>保留 Request ID、操作者與原始 payload，方便追查後台操作。</DialogDescription>
          </DialogHeader>
          {selectedLog ? (
            <div className="grid min-h-0 min-w-0 gap-4 overflow-x-hidden overflow-y-auto overscroll-contain px-6 pb-4 text-sm">
              <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                <DetailItem label="時間" value={formatDate(selectedLog.createdAt)} />
                <DetailItem label="狀態" value={getStatusLabel(selectedLog.status)} />
                <DetailItem label="操作者" value={getActor(selectedLog)} />
                <DetailItem label="模組" value={getModule(selectedLog)} />
                <DetailItem label="HTTP 方法" value={getMethod(selectedLog)} />
                <DetailItem label="目標" value={getTarget(selectedLog)} mono />
                <DetailItem label="Request ID" value={selectedLog.requestId || '-'} mono />
                <DetailItem label="IP" value={selectedLog.ip || selectedLog.clientIp || '-'} />
                <DetailItem label="User Agent" value={selectedLog.userAgent || '-'} />
              </div>
              <div className="grid gap-2">
                <div className="font-medium">原始資料</div>
                <pre className="max-h-80 overflow-auto overscroll-contain rounded-lg border bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">關閉</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function DetailItem({ label, value, mono }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? 'break-all font-mono text-xs' : 'break-words'}>{value}</span>
    </div>
  );
}

function TargetCell({ log }) {
  const target = getTargetSummary(log);

  return (
    <div className="grid min-w-0 gap-1">
      <span className="truncate font-medium">{target.title}</span>
      <span className="truncate font-mono text-xs text-muted-foreground">{target.subtitle}</span>
    </div>
  );
}

export default function EventLogsPage() {
  return <EventLogsContent />;
}
