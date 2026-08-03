// @ts-nocheck
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sidebar = vi.hoisted(() => ({
  isMobile: false,
  setOpenMobile: vi.fn(),
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next/image', () => ({ default: (props) => <img {...props} /> }));
vi.mock('next/link', () => ({ default: ({ children, ...props }) => <a {...props}>{children}</a> }));
vi.mock('@/components/ui/sidebar', () => {
  const Wrapper = ({ children }) => <div>{children}</div>;
  const Passthrough = ({ children }) => <>{children}</>;
  return {
    Sidebar: Wrapper,
    SidebarContent: Wrapper,
    SidebarFooter: Wrapper,
    SidebarGroup: Wrapper,
    SidebarGroupContent: Wrapper,
    SidebarGroupLabel: Wrapper,
    SidebarHeader: Wrapper,
    SidebarMenu: Wrapper,
    SidebarMenuButton: Passthrough,
    SidebarMenuItem: Wrapper,
    useSidebar: () => sidebar,
  };
});

import { AppSidebar } from '@/components/layout/AppSidebar';

describe('AppSidebar logout request', () => {
  beforeEach(() => {
    sidebar.isMobile = false;
    sidebar.setOpenMobile.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens logout confirmation immediately on desktop', () => {
    const onRequestLogout = vi.fn();
    render(<AppSidebar onRequestLogout={onRequestLogout} />);

    fireEvent.click(screen.getByRole('button', { name: '登出' }));

    expect(sidebar.setOpenMobile).not.toHaveBeenCalled();
    expect(onRequestLogout).toHaveBeenCalledOnce();
  });

  it('closes the mobile sheet before opening logout confirmation', () => {
    vi.useFakeTimers();
    sidebar.isMobile = true;
    const onRequestLogout = vi.fn();
    render(<AppSidebar onRequestLogout={onRequestLogout} />);

    fireEvent.click(screen.getByRole('button', { name: '登出' }));

    expect(sidebar.setOpenMobile).toHaveBeenCalledWith(false);
    expect(onRequestLogout).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(320));
    expect(onRequestLogout).toHaveBeenCalledOnce();
  });
});
