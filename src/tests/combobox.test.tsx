import React, { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

const options = ["日常", "出遊", "活動"]

function ComboboxHarness() {
  const [value, setValue] = useState<string | null>(null)

  return (
    <Dialog open>
      <DialogContent>
        <DialogTitle>新增日常</DialogTitle>
        <Combobox items={options} value={value} onValueChange={setValue}>
          <ComboboxInput aria-label="分類" />
          <ComboboxContent>
            <ComboboxEmpty>沒有符合的選項</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <output aria-label="已選分類">{value}</output>
      </DialogContent>
    </Dialog>
  )
}

describe("Combobox", () => {
  it("can open the popup and select an option by clicking", async () => {
    render(<ComboboxHarness />)

    fireEvent.click(screen.getByRole("button", { name: "顯示選項" }))
    const option = await screen.findByRole("option", { name: "出遊" })
    fireEvent.pointerDown(option)
    fireEvent.click(option)

    await waitFor(() => {
      expect(screen.getByLabelText("已選分類").textContent).toBe("出遊")
      expect(
        (screen.getByRole("combobox", { name: "分類" }) as HTMLInputElement).value
      ).toBe("出遊")
      expect(screen.getByRole("dialog")).toBeTruthy()
    })
  })
})
