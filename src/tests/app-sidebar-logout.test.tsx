// @ts-nocheck
import React, { createRef, useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => true,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ priority, ...props }) => <img {...props} />,
}));

vi.mock('@/services/authService', () => ({ logout: vi.fn() }));
vi.mock('@/components/ui/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function OpenMobileSidebar() {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(true);
  }, [setOpenMobile]);

  return null;
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('mobile sidebar logout', () => {
  it('opens the confirmation after the mobile sheet closes', async () => {
    render(
      <SidebarProvider>
        <OpenMobileSidebar />
        <AppSidebar />
      </SidebarProvider>
    );

    fireEvent.click(await screen.findByRole('button', { name: '登出' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();

    await waitFor(() => expect(screen.getByRole('alertdialog')).toBeTruthy(), { timeout: 1000 });
    expect(screen.getByText('確認登出？')).toBeTruthy();
  });

  it('forwards the button ref required by dialog primitives', () => {
    const ref = createRef();
    render(<Button ref={ref}>測試按鈕</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
