// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Monitor, Moon, Plus, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useColorTheme } from '@/components/layout/ColorThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { NAVIGATION_GROUPS } from '@/config/navigation';

const themeActions = [
  { value: 'theme-light', title: '切換淺色主題', theme: 'light', icon: Sun },
  { value: 'theme-dark', title: '切換深色主題', theme: 'dark', icon: Moon },
  { value: 'theme-system', title: '跟隨系統主題', theme: 'system', icon: Monitor },
];

export function CommandPalette({ actions = [] }) {
  const router = useRouter();
  const { setTheme, theme: activeTheme } = useTheme();
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();
  const [open, setOpen] = useState(false);
  const items = useMemo(() => NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))), []);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
      }))
  );
  const actionEntries = actions.map((action) => ({
    value: `action:${action.value}`,
    label: `${action.title} ${action.keywords || ''}`,
    title: action.title,
    group: '操作',
    icon: action.icon || Plus,
    shortcut: action.shortcut,
    run: () => runAction(action),
  }));
  const themeEntries = themeActions.map((action) => ({
    value: action.value,
    label: action.title,
    title: action.title,
    group: '主題',
    icon: action.icon,
    checked: activeTheme === action.theme,
    run: () => selectTheme(action.theme),
  }));
  const colorEntries = colorThemes.map((theme) => ({
    value: `color:${theme.value}`,
    label: `配色 ${theme.label}`,
    title: theme.label,
    group: '配色',
    color: theme.color,
    checked: colorTheme === theme.value,
    run: () => selectColorTheme(theme.value),
  }));
  const commandEntries = [
    ...navigationEntries,
    ...actionEntries,
    ...themeEntries,
    ...colorEntries,
  ];

  function renderGroup(label, entries) {
    if (!entries.length) return null;

    return (
      <ComboboxGroup key={label}>
        <ComboboxLabel>{label}</ComboboxLabel>
        {entries.map((entry) => {
          const Icon = entry.icon;

          return (
            <ComboboxItem key={entry.value} value={entry}>
              {Icon ? <Icon /> : <span className="size-3 rounded-full border" style={{ backgroundColor: entry.color }} />}
              <span>{entry.title}</span>
              {entry.shortcut ? <span className="ml-auto text-xs text-muted-foreground">{entry.shortcut}</span> : null}
              {entry.checked ? <Check className="ml-auto" /> : null}
            </ComboboxItem>
          );
        })}
      </ComboboxGroup>
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="top-1/3 translate-y-0 overflow-visible rounded-xl p-1" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>命令選單</DialogTitle>
            <DialogDescription>搜尋頁面或功能</DialogDescription>
          </DialogHeader>
          <Combobox
            items={commandEntries}
            open={open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setOpen(false);
            }}
            onValueChange={(entry) => entry?.run?.()}
            itemToStringLabel={(entry) => entry?.label || ''}
            autoHighlight
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <ComboboxInput className="pl-8" placeholder="搜尋頁面或功能..." showTrigger={false} />
            </div>
            <ComboboxContent className="max-h-80">
              <ComboboxEmpty className="py-6">找不到符合的項目</ComboboxEmpty>
              <ComboboxList>
                {renderGroup('導覽', navigationEntries)}
                {actionEntries.length ? <ComboboxSeparator /> : null}
                {renderGroup('操作', actionEntries)}
                <ComboboxSeparator />
                {renderGroup('主題', themeEntries)}
                <ComboboxSeparator />
                {renderGroup('配色', colorEntries)}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </DialogContent>
      </Dialog>
    </>
  );
}
