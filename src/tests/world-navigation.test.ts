import { describe, expect, it } from "vitest";
import {
  WORLD_NAVIGATION,
  NAVIGATION_GROUPS,
  findNavigationItem,
  getNavigationLinks,
} from "@/config/navigation";
import { buildSettingsPayload } from "@/components/features/canis-world/SettingsPage";

describe("網站管理獨立頁面", () => {
  it("七個子頁可供導覽與搜尋，且不保留舊入口", () => {
    expect(WORLD_NAVIGATION).toHaveLength(7);
    const links = NAVIGATION_GROUPS.flatMap((group) =>
      getNavigationLinks(group.items),
    );
    for (const item of WORLD_NAVIGATION) {
      expect(findNavigationItem(item.href)?.title).toBe(item.title);
      expect(links.filter((link) => link.href === item.href)).toHaveLength(1);
    }
    expect(findNavigationItem("/canis-world")).toBeUndefined();
  });
  it.each(["status", "content", "footer"])(
    "%s 儲存僅送出目前區塊",
    (section) => {
      const value = { label: "新內容" };
      expect(buildSettingsPayload(section, value)).toEqual({
        [section]: value,
      });
    },
  );
  it("角色介紹只更新該區塊並清理標籤輸入", () => {
    expect(
      buildSettingsPayload("profile", {
        displayName: "Canis",
        traitsText: "日常, , 照片 ",
      }),
    ).toEqual({ profile: { displayName: "Canis", traits: ["日常", "照片"] } });
  });
});
