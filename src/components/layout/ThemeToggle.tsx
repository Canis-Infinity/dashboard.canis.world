// @ts-nocheck
'use client';

import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useColorTheme } from '@/components/layout/ColorThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();
  const isDark = resolvedTheme === 'dark';

  const label = '主題設定';
  const modeItems = [
    { value: 'light', label: '淺色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟隨系統', icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="relative" aria-label={label}>
              <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>深淺主題</DropdownMenuLabel>
        {modeItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.value} onClick={() => setTheme(item.value)}>
              <Icon className="size-4" />
              <span>{item.label}</span>
              {theme === item.value ? <Check className="ml-auto size-4" /> : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>顏色主題</DropdownMenuLabel>
        {colorThemes.map((item) => (
          <DropdownMenuItem key={item.value} onClick={() => setColorTheme(item.value)}>
            <span className="size-3 rounded-full border" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
            {colorTheme === item.value ? <Check className="ml-auto size-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setColorTheme('ocean')}>
          <Palette className="size-4" />
          <span>重設色票</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
