import React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import NextTopLoader from "nextjs-toploader"
import { DataTable } from "@/components/ui/data-table"
import { PaginationLink } from "@/components/ui/pagination"

afterEach(cleanup)

describe("table pagination with the global top loader", () => {
  it("changes pages without starting navigation or submitting a form", () => {
    let submissions = 0
    render(
      <form onSubmit={(event) => { event.preventDefault(); submissions++ }}>
        <NextTopLoader />
        <DataTable
          columns={[{ accessorKey: "title", header: "標題" }]}
          data={Array.from({ length: 12 }, (_, index) => ({ title: `紀錄 ${index + 1}` }))}
        />
      </form>,
    )
    const previous = screen.getByRole("button", { name: "上一頁" }) as HTMLButtonElement
    expect(previous.disabled).toBe(true)
    expect(screen.queryByText("紀錄 11")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "2" }))
    expect(screen.getByText("紀錄 11")).toBeTruthy()
    expect((screen.getByRole("button", { name: "下一頁" }) as HTMLButtonElement).disabled).toBe(true)
    expect(document.querySelector("#nprogress")).toBeNull()
    fireEvent.click(previous)
    expect(screen.getByText("紀錄 1")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "下一頁" }))
    expect(screen.getByText("紀錄 12")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "2" }))
    expect(document.querySelector("#nprogress")).toBeNull()
    expect(submissions).toBe(0)
  })

  it("keeps real navigation links available", () => {
    render(<PaginationLink href="/entries?page=2">2</PaginationLink>)
    expect(screen.getByRole("link", { name: "2" }).getAttribute("href")).toBe("/entries?page=2")
  })
})
