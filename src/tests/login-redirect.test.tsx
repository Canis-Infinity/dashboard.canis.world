import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '@/app/(user)/login/page';
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
const router = { replace };
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/services/authService', () => ({ login: vi.fn() }));
describe('登入頁導向', () => {
  beforeEach(() => { localStorage.clear(); replace.mockClear(); });
  it('已登入直接取代歷史紀錄並導向首頁，不顯示登入表單', async () => {
    localStorage.setItem('token', JSON.stringify({ token: 'test-only' }));
    render(<Login />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByLabelText('帳號')).toBeNull();
  });
  it('未登入顯示登入表單', async () => {
    render(<Login />);
    await screen.findByLabelText('帳號');
    expect(replace).not.toHaveBeenCalled();
  });
});
