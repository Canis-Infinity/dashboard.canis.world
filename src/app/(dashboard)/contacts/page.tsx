// @ts-nocheck
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Info, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import DashboardShell from '@/components/layout/DashboardShell';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ContactDialog } from '@/components/features/contacts/ContactDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { deleteContact, getContact, getContacts } from '@/services/contactService';
import { getErrorMessage } from '@/utils/apiError';

const tabs = [
  { type: 'all', title: '全部' },
  { type: 'unread', title: '未讀' },
  { type: 'pending', title: '佇列' },
  { type: 'done', title: '完成' },
];

const statusLabels = {
  unread: '未讀',
  pending: '佇列',
  done: '完成',
};

const statusBadgeClassNames = {
  unread: 'border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  pending: 'border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  done: 'border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
};

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export default function Contacts() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('all');
  const [modalShow, setModalShow] = useState(false);
  const [removeModalShow, setRemoveModalShow] = useState(false);
  const [selectedContact, setSelectedContact] = useState({});
  const [removeDetail, setRemoveDetail] = useState({});

  const params = useMemo(() => ({ page, ...(type !== 'all' ? { type } : {}) }), [page, type]);
  const fetchContacts = useCallback(() => getContacts(params), [params]);
  const { data, loading, error, refetch } = useAsyncResource(fetchContacts, [params], {
    initialData: { data: [], page: 1, total: 0 },
    fallbackError: '無法取得聯絡列表',
  });

  const contacts = data?.data || [];
  const total = data?.total || 1;
  const currentPage = data?.page || page;
  const columns = useMemo(() => [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="時間" />,
      cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="姓名" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'subject',
      header: ({ column }) => <DataTableColumnHeader column={column} title="主旨" />,
      cell: ({ row }) => <span className="line-clamp-1">{row.original.subject || '-'}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="狀態" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={statusBadgeClassNames[row.original.status]}>
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="信箱" />,
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <div className="text-right">動作</div>,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="查看聯絡表單" onClick={() => openDetail(row.original._id)}>
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>查看聯絡表單</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="刪除聯絡表單"
                onClick={() => {
                  setRemoveDetail({ id: row.original._id, name: row.original.name, time: formatDate(row.original.createdAt) });
                  setRemoveModalShow(true);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>刪除聯絡表單</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ], []);

  async function openDetail(id) {
    try {
      const contact = await getContact(id);
      setSelectedContact(contact || {});
      setModalShow(true);
    } catch (error) {
      toast.error(getErrorMessage(error, '無法取得聯絡表單'));
    }
  }

  async function confirmDelete() {
    try {
      const result = await deleteContact(removeDetail.id);
      await refetch();
      setRemoveDetail({});
      setRemoveModalShow(false);
      toast.success(result.message || '刪除完成');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <DashboardShell title="聯絡列表" description="查看訪客提交的聯絡表單並追蹤處理狀態。">
      <div className="flex flex-col gap-4 border-b border-border md:flex-row md:items-end md:justify-between">
        <Tabs
          value={type}
          onValueChange={(value) => {
            setPage(1);
            setType(value);
          }}
        >
          <TabsList variant="line">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.type}
                value={item.type}
              >
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {error ? (
            <Alert variant="destructive" className="m-4">
              <AlertTitle>讀取失敗</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DataTable
            columns={columns}
            data={contacts}
            loading={loading}
            emptyText="尚無聯絡表單"
            emptyDescription={type === 'all' ? '訪客送出聯絡表單後會顯示在這裡。' : '目前沒有符合此處理狀態的聯絡表單。'}
            pageSize={10}
            pageIndex={currentPage - 1}
            pageCount={total}
            totalRows={(total - 1) * 10 + contacts.length}
            paginationSummary={`第 ${currentPage} / ${total || 1} 頁`}
            onPageChange={(nextPageIndex) => setPage(nextPageIndex + 1)}
          />
        </CardContent>
      </Card>

      <ContactDialog open={modalShow} onOpenChange={setModalShow} contact={selectedContact} onSaved={refetch} />
      <ConfirmDialog
        open={removeModalShow}
        onOpenChange={setRemoveModalShow}
        title="刪除聯絡表單"
        description={`請問是否要刪除「${removeDetail.name || ''}」於 ${removeDetail.time || ''} 提交的表單？此動作無法復原。`}
        confirmText="刪除"
        onConfirm={confirmDelete}
      />
    </DashboardShell>
  );
}
