// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { buildDashboardCards, buildWeeklyChartData } from '@/utils/dashboard';

describe('dashboard utils', () => {
  it('builds stat cards with period changes', () => {
    expect(
      buildDashboardCards({
        todayCanisDenVisit: 10,
        lastCanisDenVisit: 7,
        thisWeekCanisDenVisit: 30,
        lastWeekCanisDenVisit: 40,
        todayFrontendVisit: 4,
        lastFrontendVisit: 2,
        thisWeekFrontendVisit: 11,
        lastWeekFrontendVisit: 9,
        todayContact: 3,
        lastContact: 1,
        thisWeekContact: 8,
        lastWeekContact: 5,
      })
    ).toEqual([
      expect.objectContaining({ id: 'todayCanisDenVisitors', value: 10, change: 3 }),
      expect.objectContaining({ id: 'weekCanisDenVisitors', value: 30, change: -10 }),
      expect.objectContaining({ id: 'todayFrontendVisitors', value: 4, change: 2 }),
      expect.objectContaining({ id: 'weekFrontendVisitors', value: 11, change: 2 }),
      expect.objectContaining({ id: 'todayContact', value: 3, change: 2 }),
      expect.objectContaining({ id: 'weekContact', value: 8, change: 3 }),
    ]);
  });

  it('fills missing weekly chart dates with zero', () => {
    const result = buildWeeklyChartData(
      {
        thisWeekCanisDenVisitByDay: [{ date: '07-31', amount: 5 }],
        thisWeekFrontendVisitByDay: [{ date: '07-31', amount: 3 }],
        thisWeekContactByDay: [{ date: '07-30', amount: 2 }],
      },
      new Date('2026-07-31T12:00:00+08:00')
    );

    expect(result).toHaveLength(7);
    expect(result.at(-1)).toEqual({ name: '07-31', canisDenVisitors: 5, frontendVisitors: 3, contact: 0 });
    expect(result.at(-2)).toEqual({ name: '07-30', canisDenVisitors: 0, frontendVisitors: 0, contact: 2 });
  });
});
