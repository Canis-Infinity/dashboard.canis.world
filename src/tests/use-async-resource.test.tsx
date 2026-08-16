import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useAsyncResource } from "@/hooks/useAsyncResource"

describe("useAsyncResource", () => {
  it("keeps existing data visible while refetching", async () => {
    let resolveRefresh: (value: { value: string }) => void = () => {}
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ value: "initial" })
      .mockImplementationOnce(
        () =>
          new Promise<{ value: string }>((resolve) => {
            resolveRefresh = resolve
          })
      )

    const { result } = renderHook(() =>
      useAsyncResource(fetcher, [], { initialData: null })
    )

    await waitFor(() => expect(result.current.data).toEqual({ value: "initial" }))

    let refreshPromise: Promise<unknown>
    act(() => {
      refreshPromise = result.current.refetch()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.refreshing).toBe(true)
    expect(result.current.data).toEqual({ value: "initial" })

    await act(async () => {
      resolveRefresh({ value: "updated" })
      await refreshPromise
    })

    expect(result.current.data).toEqual({ value: "updated" })
    expect(result.current.refreshing).toBe(false)
  })
})
