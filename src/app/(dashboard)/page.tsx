// @ts-nocheck
'use client';

import { useCallback, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Mail, TrendingDown, TrendingUp, Users } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDashboardCards, getDashboardChart } from '@/services/dashboardService';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { buildDashboardCards, buildWeeklyChartData } from '@/utils/dashboard';
import { cn } from '@/lib/utils';

const chartConfig = {
  canisDenVisitors: {
    label: 'Canis Den 造訪',
    color: 'var(--primary)',
  },
  frontendVisitors: {
    label: 'Canis World 造訪',
    color: 'var(--chart-3)',
  },
  contact: {
    label: '聯絡人數',
    color: 'var(--chart-2)',
  },
};

const siteSections = [
  {
    id: 'canis-den',
    title: 'Canis Den',
    domain: 'link.canis.world',
    description: '連結入口、個人資料、外部連結與聯絡表單。',
    cardIds: ['todayCanisDenVisitors', 'weekCanisDenVisitors', 'todayContact', 'weekContact'],
    chartKeys: ['canisDenVisitors', 'contact'],
  },
  {
    id: 'canis-world',
    title: 'Canis World',
    domain: 'canis.world',
    description: '主站的人型犬日常、照片與基地紀錄。',
    cardIds: ['todayFrontendVisitors', 'weekFrontendVisitors'],
    chartKeys: ['frontendVisitors'],
  },
];

const iconMap = {
  todayCanisDenVisitors: Users,
  weekCanisDenVisitors: Users,
  todayFrontendVisitors: Users,
  weekFrontendVisitors: Users,
  todayContact: Mail,
  weekContact: Mail,
};

function InteractiveChartLegend({ payload, hiddenSeries, onToggle, config }) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
      {payload.map((item) => {
        const key = `${item.dataKey || item.value}`;
        const hidden = hiddenSeries.includes(key);
        const itemConfig = config[key];

        return (
          <button
            key={key}
            type="button"
            aria-pressed={!hidden}
            onClick={() => onToggle(key)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              hidden && 'opacity-45'
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {itemConfig?.label || item.value}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ item, loading }) {
  const Icon = iconMap[item.id] || Users;
  const positive = item.change >= 0;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {loading ? <Skeleton className="h-4 w-24" /> : <CardDescription>{item.title}</CardDescription>}
        {loading ? <Skeleton className="size-4" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3">
            <Skeleton className="h-10 w-20" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ) : (
          <>
            <CardTitle className="text-4xl">{item.value}</CardTitle>
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <TrendIcon className={positive ? 'h-4 w-4 text-emerald-500' : 'h-4 w-4 text-destructive'} />
              {positive ? '+' : ''}
              {item.change}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardChartSkeleton() {
  const heights = ['38%', '54%', '46%', '72%', '61%', '82%', '68%'];

  return (
    <div className="grid h-[360px] grid-rows-[1fr_auto_auto] gap-3 px-2 pb-2 pt-4" aria-label="正在載入近七日趨勢">
      <div className="relative flex min-h-0 items-end gap-2 border-b border-l px-3 sm:gap-4">
        <div className="pointer-events-none absolute inset-0 grid grid-rows-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="border-t border-border/70" />)}
        </div>
        {heights.map((height, index) => (
          <div key={index} className="relative flex h-full flex-1 items-end justify-center gap-1">
            <Skeleton className="w-2/5 rounded-b-none" style={{ height }} />
            <Skeleton className="w-1/4 rounded-b-none opacity-60" style={{ height: `${Math.max(18, Number.parseInt(height, 10) - 18)}%` }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 px-3 sm:gap-4">
        {heights.map((_, index) => <Skeleton key={index} className="mx-auto h-3 w-8 max-w-full" />)}
      </div>
      <div className="flex justify-center gap-5">
        <div className="flex items-center gap-2"><Skeleton className="size-2.5" /><Skeleton className="h-3 w-14" /></div>
        <div className="flex items-center gap-2"><Skeleton className="size-2.5" /><Skeleton className="h-3 w-14" /></div>
        <div className="flex items-center gap-2"><Skeleton className="size-2.5" /><Skeleton className="h-3 w-14" /></div>
      </div>
    </div>
  );
}

function TrendChart({ config, data, hiddenSeries, onToggle, series }) {
  return (
    <ChartContainer config={config} className="h-[280px] w-full overflow-hidden">
      <AreaChart accessibilityLayer data={data} margin={{ left: 8, right: 24, top: 18, bottom: 4 }}>
        <defs>
          {series.map((key) => (
            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={key === 'contact' ? 0.45 : 0.68} />
              <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis hide domain={[0, (dataMax) => Math.max(4, Math.ceil(dataMax + 1))]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend
          content={<InteractiveChartLegend hiddenSeries={hiddenSeries} onToggle={onToggle} config={config} />}
        />
        {series.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            fill={`url(#fill-${key})`}
            hide={hiddenSeries.includes(key)}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            stackId={key}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

function SiteSection({ section, cards, chartData, loading, hiddenSeries, onToggle }) {
  const sectionCards = cards.filter((item) => section.cardIds.includes(item.id));
  const sectionChartConfig = Object.fromEntries(section.chartKeys.map((key) => [key, chartConfig[key]]));

  return (
    <section className="grid w-full gap-4">
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sectionCards.map((item) => (
          <StatCard key={item.id} item={item} loading={loading.cards} />
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          {loading.chart ? (
            <>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </>
            ) : (
              <>
                <CardTitle>{section.title} 近七日趨勢</CardTitle>
                <CardDescription>{section.domain} · {section.description}</CardDescription>
              </>
            )}
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading.chart ? (
            <DashboardChartSkeleton />
          ) : (
            <TrendChart
              config={sectionChartConfig}
              data={chartData}
              hiddenSeries={hiddenSeries}
              onToggle={onToggle}
              series={section.chartKeys}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default function Home() {
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const fetchCards = useCallback(() => getDashboardCards(), []);
  const fetchChart = useCallback(() => getDashboardChart(), []);
  const cards = useAsyncResource(fetchCards, [], { initialData: {}, fallbackError: '無法取得儀表板卡片' });
  const chart = useAsyncResource(fetchChart, [], { initialData: {}, fallbackError: '無法取得圖表資料' });

  const cardItems = useMemo(() => buildDashboardCards(cards.data || {}), [cards.data]);
  const chartData = useMemo(() => buildWeeklyChartData(chart.data || {}), [chart.data]);
  const toggleSeries = useCallback((key) => {
    setHiddenSeries((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }, []);

  return (
    <DashboardShell title="儀表板" description="依站台分開查看造訪與互動狀況。">
      {cards.error || chart.error ? (
        <Alert variant="destructive">
          <AlertTitle>資料讀取失敗</AlertTitle>
          <AlertDescription>{cards.error || chart.error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="canis-den" className="w-full">
        <div className="flex flex-col gap-4 border-b border-border md:flex-row md:items-end md:justify-between">
          <TabsList variant="line">
            {siteSections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {siteSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <SiteSection
              section={section}
              cards={cardItems}
              chartData={chartData}
              loading={{ cards: cards.loading, chart: chart.loading }}
              hiddenSeries={hiddenSeries}
              onToggle={toggleSeries}
            />
          </TabsContent>
        ))}
      </Tabs>
    </DashboardShell>
  );
}
