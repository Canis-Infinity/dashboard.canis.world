// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Monitor, Moon, Plus, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useColorTheme } from '@/components/layout/ColorThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
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
  const [showSelection, setShowSelection] = useState(false);
  const items = useMemo(() => NAVIGATION_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))), []);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => {
          const nextOpen = !value;
          setShowSelection(false);
          return nextOpen;
        });
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
    if (!nextOpen) {
      setShowSelection(false);
    }
  }

  function handleCommandKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      setShowSelection(true);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden h-9 w-72 justify-start gap-2 px-3 text-muted-foreground md:flex xl:w-96"
        onClick={() => {
          setShowSelection(false);
          setOpen(true);
        }}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">搜尋頁面</span>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <Command data-show-selection={showSelection ? 'true' : 'false'} onKeyDown={handleCommandKeyDown}>
          <CommandInput placeholder="搜尋頁面或功能..." />
          <CommandList>
            <CommandEmpty>找不到符合的項目</CommandEmpty>
            {NAVIGATION_GROUPS.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {items
                  .filter((item) => item.group === group.label)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem key={item.href} value={`${item.title} ${item.href}`} onSelect={() => goTo(item.href)}>
                        <Icon />
                        <span>{item.title}</span>
                        <CommandShortcut>{item.href}</CommandShortcut>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
            {actions.length ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="操作">
                  {actions.map((action) => {
                    const Icon = action.icon || Plus;
                    return (
                      <CommandItem key={action.value} value={`${action.title} ${action.keywords || ''}`} onSelect={() => runAction(action)}>
                        <Icon />
                        <span>{action.title}</span>
                        {action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            ) : null}
            <CommandSeparator />
            <CommandGroup heading="主題">
              {themeActions.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.value}
                    value={action.title}
                    data-checked={activeTheme === action.theme ? 'true' : undefined}
                    onSelect={() => selectTheme(action.theme)}
                  >
                    <Icon />
                    <span>{action.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="配色">
              {colorThemes.map((theme) => (
                <CommandItem
                  key={theme.value}
                  value={`配色 ${theme.label}`}
                  data-checked={colorTheme === theme.value ? 'true' : undefined}
                  onSelect={() => selectColorTheme(theme.value)}
                >
                  <span className="size-3 rounded-full border" style={{ backgroundColor: theme.color }} />
                  <span>{theme.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
