import React, { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  IconCombobox,
  normalizeLucideIconName,
} from "@/components/shared/IconCombobox"

vi.mock("lucide-react/dynamic", () => ({
  iconNames: ["globe", "instagram", "message-circle", "map-pin"],
  DynamicIcon: ({ name }: { name: string }) => (
    <svg aria-label={`${name} 圖示`} />
  ),
}))

function IconComboboxHarness() {
  const [value, setValue] = useState("globe")

  return (
    <>
      <IconCombobox value={value} onValueChange={setValue} />
      <output aria-label="已選圖示">{value}</output>
    </>
  )
}

describe("IconCombobox", () => {
  it("normalizes legacy Lucide component names", () => {
    expect(normalizeLucideIconName("MessageCircle")).toBe("message-circle")
    expect(normalizeLucideIconName("Map_Pin")).toBe("map-pin")
  })

  it("searches and selects an icon with a preview", async () => {
    render(<IconComboboxHarness />)

    const input = screen.getByRole("combobox", { name: "Lucide 圖示" })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: "insta" } })

    const option = await screen.findByRole("option", { name: /instagram/ })
    expect(screen.getByLabelText("instagram 圖示")).toBeTruthy()

    fireEvent.pointerDown(option)
    fireEvent.click(option)

    await waitFor(() => {
      expect(screen.getByLabelText("已選圖示").textContent).toBe("instagram")
      expect((input as HTMLInputElement).value).toBe("instagram")
    })
  })

  it("shows an empty state when there are no matching icons", async () => {
    render(<IconComboboxHarness />)

    const input = screen.getByRole("combobox", { name: "Lucide 圖示" })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: "not-an-icon" } })

    expect(await screen.findByText("找不到圖示")).toBeTruthy()
  })
})
