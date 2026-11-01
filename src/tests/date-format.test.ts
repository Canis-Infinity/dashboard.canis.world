import { describe, expect, it } from 'vitest';
import { formatDisplayDate } from '@/utils/date';

describe('日期顯示格式', () => {
  it('年月日補零且以連字號分隔', () => {
    expect(formatDisplayDate('2026-07-06T12:03:04')).toBe('2026-07-06');
  });
  it('時間欄位保留原本精度', () => {
    expect(formatDisplayDate('2026-07-06T12:03:04', 'yyyy-MM-dd HH:mm:ss')).toBe('2026-07-06 12:03:04');
  });
  it('缺漏或無效日期顯示預設文字', () => {
    expect(formatDisplayDate(undefined)).toBe('-');
    expect(formatDisplayDate('invalid')).toBe('-');
  });
});
