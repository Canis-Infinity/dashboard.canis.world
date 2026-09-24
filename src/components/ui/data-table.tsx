// @ts-nocheck
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function DataTableColumnHeader({ column, title, className = undefined }) {
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown

  if (!column.getCanSort()) {
    return <div className={cn("whitespace-nowrap", className)}>{title}</div>
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-7 gap-1 px-2 text-muted-foreground hover:text-foreground", sorted && "text-foreground", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <Icon className={cn("size-3.5", sorted ? "text-foreground" : "text-muted-foreground")} />
    </Button>
  )
}

function createDataTableSelectionColumn({ label = "資料列", getRowLabel = undefined } = {}) {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => {
      const allSelected = table.getIsAllPageRowsSelected()
      const someSelected = table.getIsSomePageRowsSelected()

      return (
        <Checkbox
          aria-label={`選取目前頁面的所有${label}`}
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        />
      )
    },
    cell: ({ row }) => {
      const rowLabel = getRowLabel?.(row.original) || row.id
      return (
        <Checkbox
          aria-label={`選取${label}：${rowLabel}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(checked)}
          onClick={(event) => event.stopPropagation()}
        />
      )
    },
    meta: {
      headerClassName: "w-10",
      cellClassName: "w-10",
    },
  }
}

function DataTable({
  columns,
  data,
  loading = undefined,
  emptyText = "暫無資料",
  emptyDescription = "目前沒有可顯示的資料。",
  pageSize = 10,
  showPagination = true,
  pageIndex = undefined,
  pageCount = undefined,
  totalRows = undefined,
  paginationSummary = undefined,
  onPageChange = undefined,
  initialSorting = [],
  enableSorting = true,
  rowSelection = undefined,
  onRowSelectionChange = undefined,
  getRowId = undefined,
  selectionToolbar = undefined,
  className = undefined,
}) {
  const [sorting, setSorting] = React.useState(initialSorting)
  const [pagination, setPagination] = React.useState({
    pageIndex: pageIndex ?? 0,
    pageSize,
  })
  const isControlledPagination = typeof pageIndex === "number" && typeof onPageChange === "function"
  const currentPageIndex = isControlledPagination ? pageIndex : pagination.pageIndex
  const currentPageSize = isControlledPagination ? pageSize : pagination.pageSize

  React.useEffect(() => {
    if (isControlledPagination) return
    setPagination((current) => ({ ...current, pageSize }))
  }, [isControlledPagination, pageSize])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      },
      rowSelection: rowSelection || {},
    },
    enableSorting,
    enableRowSelection: Boolean(onRowSelectionChange),
    getRowId,
    manualPagination: isControlledPagination,
    pageCount: isControlledPagination ? pageCount : undefined,
    onSortingChange: setSorting,
    onRowSelectionChange,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: isControlledPagination ? undefined : getPaginationRowModel(),
  })

  const rows = table.getRowModel().rows
  const resolvedPageCount = isControlledPagination ? pageCount || 1 : table.getPageCount() || 1
  const canPreviousPage = currentPageIndex > 0
  const canNextPage = currentPageIndex + 1 < resolvedPageCount
  const rowCount = totalRows ?? data.length
  const displayStart = rowCount && rows.length ? currentPageIndex * currentPageSize + 1 : 0
  const displayEnd = rowCount && rows.length ? Math.min(displayStart + rows.length - 1, rowCount) : 0
  const summaryText = paginationSummary || `顯示第 ${displayStart} 到 ${displayEnd} 筆，共 ${rowCount} 筆資料`
  const pageSizeOptions = [10, 20, 50]
  const paginationItems = React.useMemo(() => {
    if (resolvedPageCount <= 5) {
      return Array.from({ length: resolvedPageCount }, (_, index) => index)
    }

    const pages = new Set([0, resolvedPageCount - 1, currentPageIndex])
    if (currentPageIndex > 1) pages.add(currentPageIndex - 1)
    if (currentPageIndex < resolvedPageCount - 2) pages.add(currentPageIndex + 1)

    return Array.from(pages)
      .sort((a, b) => a - b)
      .reduce((items, pageNumber, index, sortedPages) => {
        const previousPage = sortedPages[index - 1]
        if (index > 0 && pageNumber - previousPage > 1) {
          items.push(`ellipsis-${pageNumber}`)
        }
        items.push(pageNumber)
        return items
      }, [])
  }, [currentPageIndex, resolvedPageCount])

  function goToPage(nextPageIndex) {
    const safePageIndex = Math.min(Math.max(nextPageIndex, 0), resolvedPageCount - 1)
    if (isControlledPagination) {
      onPageChange(safePageIndex)
      return
    }
    table.setPageIndex(safePageIndex)
  }

  return (
    <div className={cn("w-full", className)}>
      {selectionToolbar ? (
        <div className="border-b bg-muted/20 px-4 py-3">{selectionToolbar}</div>
      ) : null}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn("whitespace-nowrap text-sm", header.column.columnDef.meta?.headerClassName)}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: currentPageSize }).map((_, row) => (
                <TableRow key={row}>
                  {columns.map((column, cell) => (
                    <TableCell key={column.id || column.accessorKey || cell}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("whitespace-nowrap", cell.column.columnDef.meta?.cellClassName)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : null}
          </TableBody>
        </Table>
      </div>
      {!loading && rows.length === 0 ? (
        <Empty className="rounded-none border-0 py-10 md:py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
            <EmptyTitle>{emptyText}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {showPagination ? (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="order-2 flex justify-center text-center md:order-1 md:items-center md:justify-start md:gap-3 md:text-left">
            <span>{summaryText}</span>
            <div className="hidden items-center gap-2 md:flex">
              <span>每頁筆數</span>
              <Select
                value={String(currentPageSize)}
                disabled={isControlledPagination}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                  table.setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-9 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Pagination className="order-1 mx-0 w-full justify-center md:order-2 md:w-auto md:justify-end">
            <PaginationContent className="w-full gap-3 md:w-auto md:gap-1">
              <PaginationItem className="flex flex-1 md:flex-none">
                <PaginationPrevious
                  href="#"
                  className={cn(
                    "h-10 flex-1 justify-center md:h-9 md:flex-none",
                    canPreviousPage ? "" : "pointer-events-none opacity-50"
                  )}
                  aria-disabled={!canPreviousPage}
                  onClick={(event) => {
                    event.preventDefault()
                    goToPage(currentPageIndex - 1)
                  }}
                />
              </PaginationItem>
              {paginationItems.map((item) => {
                if (typeof item === "string") {
                  return (
                    <PaginationItem key={item} className="hidden md:block">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return (
                  <PaginationItem key={item} className="hidden md:block">
                    <PaginationLink
                      href="#"
                      isActive={item === currentPageIndex}
                      onClick={(event) => {
                        event.preventDefault()
                        goToPage(item)
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem className="flex flex-1 md:flex-none">
                <PaginationNext
                  href="#"
                  className={cn(
                    "h-10 flex-1 justify-center md:h-9 md:flex-none",
                    canNextPage ? "" : "pointer-events-none opacity-50"
                  )}
                  aria-disabled={!canNextPage}
                  onClick={(event) => {
                    event.preventDefault()
                    goToPage(currentPageIndex + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

export { DataTable, DataTableColumnHeader, createDataTableSelectionColumn }
