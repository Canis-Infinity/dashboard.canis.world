// @ts-nocheck
const DAY_MS = 24 * 60 * 60 * 1000;

export function buildDashboardCards(data = {}) {
  const {
    todayVisit = 0,
    lastVist = 0,
    thisWeekVisit = 0,
    lastWeekVisit = 0,
    todayCanisDenVisit = todayVisit,
    lastCanisDenVisit = lastVist,
    thisWeekCanisDenVisit = thisWeekVisit,
    lastWeekCanisDenVisit = lastWeekVisit,
    todayFrontendVisit = 0,
    lastFrontendVisit = 0,
    thisWeekFrontendVisit = 0,
    lastWeekFrontendVisit = 0,
    todayContact = 0,
    lastContact = 0,
    thisWeekContact = 0,
    lastWeekContact = 0,
  } = data;

  return [
    {
      id: 'todayCanisDenVisitors',
      title: '本日 Canis Den 造訪',
      value: todayCanisDenVisit,
      change: todayCanisDenVisit - lastCanisDenVisit,
    },
    {
      id: 'weekCanisDenVisitors',
      title: '本週 Canis Den 造訪',
      value: thisWeekCanisDenVisit,
      change: thisWeekCanisDenVisit - lastWeekCanisDenVisit,
    },
    {
      id: 'todayFrontendVisitors',
      title: '本日 Canis World 造訪',
      value: todayFrontendVisit,
      change: todayFrontendVisit - lastFrontendVisit,
    },
    {
      id: 'weekFrontendVisitors',
      title: '本週 Canis World 造訪',
      value: thisWeekFrontendVisit,
      change: thisWeekFrontendVisit - lastWeekFrontendVisit,
    },
    {
      id: 'todayContact',
      title: '本日聯絡人數',
      value: todayContact,
      change: todayContact - lastContact,
    },
    {
      id: 'weekContact',
      title: '本週聯絡人數',
      value: thisWeekContact,
      change: thisWeekContact - lastWeekContact,
    },
  ];
}

export function buildWeeklyChartData(data = {}, now = new Date()) {
  const canisDenVisitByDate = new Map(
    (data.thisWeekCanisDenVisitByDay || data.thisWeekVisitByDay || []).map((item) => [item.date, item.amount])
  );
  const frontendVisitByDate = new Map((data.thisWeekFrontendVisitByDay || []).map((item) => [item.date, item.amount]));
  const contactByDate = new Map((data.thisWeekContactByDay || []).map((item) => [item.date, item.amount]));

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(now.getTime() - (6 - index) * DAY_MS);
    const name = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
    })
      .format(date)
      .replace('/', '-');

    return {
      name,
      canisDenVisitors: canisDenVisitByDate.get(name) || 0,
      frontendVisitors: frontendVisitByDate.get(name) || 0,
      contact: contactByDate.get(name) || 0,
    };
  });
}
