import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DatePicker } from "@/components/shared/DatePicker"
import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { Textarea } from "@/components/ui/textarea"

describe("shared form conventions", () => {
  it("keeps textareas vertically resizable with at least five rows", () => {
    render(<Textarea aria-label="內容" rows={2} />)

    const textarea = screen.getByRole("textbox", { name: "內容" })
    expect(textarea.getAttribute("rows")).toBe("5")
    expect(textarea.className).toContain("resize-y")
    expect(textarea.className).not.toContain("resize-x")
  })

  it("uses a destructive action for delete confirmations", () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="刪除資料"
        description="刪除後無法復原。"
        confirmText="刪除"
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "刪除" }).className).toContain(
      "text-destructive",
    )
  })

  it("formats date ranges in Traditional Chinese", () => {
    render(
      <DateRangePicker
        value={{ from: new Date(2026, 7, 1), to: new Date(2026, 7, 31) }}
        onChange={vi.fn()}
        includeHiddenInputs={false}
      />,
    )

    expect(screen.getByRole("button", { name: "日期區間" })).toBeTruthy()
    expect(screen.getByText("2026年8月1日 - 2026年8月31日")).toBeTruthy()
  })

  it("formats a single date in Traditional Chinese", () => {
    render(
      <DatePicker
        id="occurred-at"
        label="日期"
        value="2026-08-05"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "日期" })).toBeTruthy()
    expect(screen.getByText("2026年8月5日")).toBeTruthy()
  })
})
