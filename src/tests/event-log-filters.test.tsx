import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useEventLogs } = vi.hoisted(() => ({
  useEventLogs: vi.fn((..._args: unknown[]) => ({
    data: [],
    total: 1,
    amount: 0,
    loading: false,
    error: "",
  })),
}))

vi.mock("@/hooks/useEventLogs", () => ({ useEventLogs }))
vi.mock("@/components/layout/DashboardShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}))

import EventLogsPage from "@/app/(dashboard)/event-logs/page"

describe("event log filters", () => {
  beforeEach(() => useEventLogs.mockClear())

  it("keeps draft input separate until the user applies the filter", () => {
    render(<EventLogsPage />)

    const search = screen.getByRole("textbox", { name: "搜尋" })
    fireEvent.change(search, { target: { value: "登入" } })

    expect(useEventLogs.mock.lastCall?.[0]).toMatchObject({ keyword: "" })

    fireEvent.click(screen.getByRole("button", { name: "套用篩選" }))
    expect(useEventLogs.mock.lastCall?.[0]).toMatchObject({ keyword: "登入" })
  })

  it("shows the complete filter actions before any filter is selected", () => {
    render(<EventLogsPage />)

    expect(screen.getByRole("button", { name: "套用篩選" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "重設" })).toBeTruthy()
    expect(screen.getByText("所有結果")).toBeTruthy()
    expect(screen.getByText("所有模組")).toBeTruthy()
    expect(screen.getByText("所有方法")).toBeTruthy()
  })
})
