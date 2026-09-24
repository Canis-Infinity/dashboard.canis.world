// @ts-nocheck
'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { findNavigationItem } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function SiteHeader({ title, action, commandActions }) {
  const pathname = usePathname();
  const current = findNavigationItem(pathname);
  const { state } = useSidebar();

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:transition-[left] md:duration-200 md:ease-linear',
        state === 'collapsed' ? 'md:left-[var(--sidebar-width-icon)]' : 'md:left-[var(--sidebar-width)]'
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger className="-ml-1" />
        </TooltipTrigger>
        <TooltipContent>開啟導覽列</TooltipContent>
      </Tooltip>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title || current?.title || '後台'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <CommandPalette actions={commandActions} />
        <ThemeToggle />
        {action}
      </div>
    </header>
  );
}
