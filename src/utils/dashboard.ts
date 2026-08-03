// @ts-nocheck
const DAY_MS = 24 * 60 * 60 * 1000;

export function buildDashboardCards(data = {}) {
  const {
    todayVisit = 0,
    lastVist = 0,
    thisWeekVisit = 0,
    lastWeekVisit = 0,
    todayContact = 0,
    lastContact = 0,
    thisWeekContact = 0,
    lastWeekContact = 0,
  } = data;

  return [
    {
      id: 'todayVisitors',
      title: '本日造訪人數',
      value: todayVisit,
      change: todayVisit - lastVist,
    },
    {
      id: 'weekVisitors',
      title: '本週造訪人數',
      value: thisWeekVisit,
      change: thisWeekVisit - lastWeekVisit,
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
  const visitByDate = new Map((data.thisWeekVisitByDay || []).map((item) => [item.date, item.amount]));
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
      visitors: visitByDate.get(name) || 0,
      contact: contactByDate.get(name) || 0,
    };
  });
}
