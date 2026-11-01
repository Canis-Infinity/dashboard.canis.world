import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "@/components/layout/CommandPalette";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "dark", setTheme: vi.fn() }) }));
vi.mock("@/components/layout/ColorThemeProvider", () => ({
  useColorTheme: () => ({ colorTheme: "blue", setColorTheme: vi.fn(), colorThemes: [{ value: "blue", label: "藍色", color: "blue" }] }),
}));

beforeAll(() => {
  global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Command 選單", () => {
  it("輸入框與結果清單保持在同一個對話框內，支援子頁搜尋與空結果", async () => {
    render(<CommandPalette />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog");
    const input = within(dialog).getByPlaceholderText("搜尋頁面或功能...");
    expect(dialog.contains(screen.getByRole("listbox"))).toBe(true);
    fireEvent.change(input, { target: { value: "常見問題" } });
    await waitFor(() => expect(within(dialog).getAllByRole("option")).toHaveLength(1));
    expect(within(dialog).getByRole("option").textContent).toContain("常見問題");
    fireEvent.change(input, { target: { value: "不存在的搜尋項目" } });
    await within(dialog).findByText("找不到符合的項目");
    expect(within(dialog).queryAllByRole("option")).toHaveLength(0);
  });
});
