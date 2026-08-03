// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/utils/apiError';

describe('cn', () => {
  it('merges conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4', false && 'hidden')).toBe('px-4');
  });
});

describe('api error messages', () => {
  it('maps status-only axios errors to user-facing messages', () => {
    expect(getErrorMessage({ response: { status: 401, data: {} } }, '登入失敗')).toBe('帳號或密碼錯誤，請重新確認。');
  });

  it('does not expose raw axios error messages', () => {
    expect(getErrorMessage({ message: 'Request failed with status code 500' })).toBe('操作失敗，請稍後再試');
  });
});
