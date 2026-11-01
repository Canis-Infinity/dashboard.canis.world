// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Monitor, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useColorTheme } from "@/components/layout/ColorThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { NAVIGATION_GROUPS, getNavigationLinks } from "@/config/navigation";

const themeActions = [
  { value: "theme-light", title: "切換淺色主題", theme: "light", icon: Sun },
  { value: "theme-dark", title: "切換深色主題", theme: "dark", icon: Moon },
  {
    value: "theme-system",
    title: "跟隨系統主題",
    theme: "system",
    icon: Monitor,
  },
];

export function CommandPalette({ actions = [] }) {
  const router = useRouter();
  const { setTheme, theme: activeTheme } = useTheme();
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () =>
      NAVIGATION_GROUPS.flatMap((group) =>
        getNavigationLinks(group.items).map((item) => ({
          ...item,
          group: group.label,
        })),
      ),
    [],
  );

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function goTo(href) {
    setOpen(false);
    router.push(href);
  }

  function runAction(action) {
    setOpen(false);
    action.onSelect?.();
  }

  function selectTheme(theme) {
    setOpen(false);
    setTheme(theme);
  }

  function selectColorTheme(theme) {
    setOpen(false);
    setColorTheme(theme);
  }

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
  }

  const navigationEntries = NAVIGATION_GROUPS.flatMap((group) =>
    items
      .filter((item) => item.group === group.label)
      .map((item) => ({
        value: `navigation:${item.href}`,
        label: `${item.title} ${item.href}`,
        title: item.title,
        group: group.label,
        icon: item.icon,
        shortcut: item.href,
        run: () => goTo(item.href),
      })),
  );
  const actionEntries = actions.map((action) => ({
    value: `action:${action.value}`,
    label: `${action.title} ${action.keywords || ""}`,
    title: action.title,
    group: "操作",
    icon: action.icon || Plus,
    shortcut: action.shortcut,
    run: () => runAction(action),
  }));
  const themeEntries = themeActions.map((action) => ({
    value: action.value,
    label: action.title,
    title: action.title,
    group: "主題",
    icon: action.icon,
    checked: activeTheme === action.theme,
    run: () => selectTheme(action.theme),
  }));
  const colorEntries = colorThemes.map((theme) => ({
    value: `color:${theme.value}`,
    label: `配色 ${theme.label}`,
    title: theme.label,
    group: "配色",
    color: theme.color,
    checked: colorTheme === theme.value,
    run: () => selectColorTheme(theme.value),
  }));
  function renderGroup(label, entries) {
    if (!entries.length) return null;

    return (
      <CommandGroup key={label} heading={label}>
        {entries.map((entry) => {
          const Icon = entry.icon;

          return (
            <CommandItem
              key={entry.value}
              value={entry.value}
              keywords={[entry.label, entry.group]}
              onSelect={entry.run}
            >
              {Icon ? (
                <Icon />
              ) : (
                <span
                  className="size-3 rounded-full border"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="min-w-0 truncate">{entry.title}</span>
              {entry.shortcut ? (
                <span className="ml-auto hidden max-w-[55%] truncate text-xs text-muted-foreground sm:block">
                  {entry.shortcut}
                </span>
              ) : null}
              {entry.checked ? <Check className="ml-auto" /> : null}
            </CommandItem>
          );
        })}
      </CommandGroup>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden h-9 w-72 justify-start gap-2 px-3 text-muted-foreground md:flex xl:w-96"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">搜尋頁面</span>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-9 md:hidden"
        aria-label="搜尋頁面"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="命令選單"
        description="搜尋頁面、操作與主題，使用上下方向鍵選取並按 Enter 執行。"
      >
        <Command loop label="搜尋頁面或功能">
          <CommandInput placeholder="搜尋頁面或功能..." autoFocus />
          <CommandList>
            <CommandEmpty>找不到符合的項目</CommandEmpty>
            {NAVIGATION_GROUPS.map((group) =>
              renderGroup(
                group.label,
                navigationEntries.filter(
                  (entry) => entry.group === group.label,
                ),
              ),
            )}
            {actionEntries.length ? <CommandSeparator /> : null}
            {renderGroup("操作", actionEntries)}
            <CommandSeparator />
            {renderGroup("主題", themeEntries)}
            <CommandSeparator />
            {renderGroup("配色", colorEntries)}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
