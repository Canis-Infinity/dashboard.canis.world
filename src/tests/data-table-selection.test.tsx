import React, { useState } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  DataTable,
  DataTableColumnHeader,
  createDataTableSelectionColumn,
} from "@/components/ui/data-table"

const rows = [
  { id: "1", title: "第一筆" },
  { id: "2", title: "第二筆" },
]

function SelectionTable() {
  const [rowSelection, setRowSelection] = useState({})
  const columns = [
    createDataTableSelectionColumn({
      label: "項目",
      getRowLabel: (row: (typeof rows)[number]) => row.title,
    }),
    {
      accessorKey: "title",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="標題" />
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      enableSorting={false}
      getRowId={(row: (typeof rows)[number]) => row.id}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      selectionToolbar={
        Object.keys(rowSelection).length ? (
          <div>已選取 {Object.keys(rowSelection).length} 筆</div>
        ) : null
      }
      showPagination={false}
    />
  )
}

describe("DataTable row selection", () => {
  it("uses an indeterminate header checkbox for a partial selection", () => {
    render(<SelectionTable />)

    fireEvent.click(screen.getByRole("checkbox", { name: "選取項目：第一筆" }))

    const selectAll = screen.getByRole("checkbox", {
      name: "選取目前頁面的所有項目",
    })
    expect(selectAll.getAttribute("aria-checked")).toBe("mixed")
    expect(screen.getByText("已選取 1 筆")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /標題/ })).toBeNull()
  })

  it("selects and clears every row on the current page", () => {
    render(<SelectionTable />)

    const selectAll = screen.getByRole("checkbox", {
      name: "選取目前頁面的所有項目",
    })
    fireEvent.click(selectAll)

    expect(screen.getByText("已選取 2 筆")).toBeTruthy()
    const selectedAll = screen.getByRole("checkbox", {
      name: "選取目前頁面的所有項目",
    })
    expect(selectedAll.getAttribute("aria-checked")).toBe("true")

    fireEvent.click(selectedAll)
    expect(screen.queryByText(/已選取/)).toBeNull()
  })
})
