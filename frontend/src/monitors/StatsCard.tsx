import { Card, AreaChart } from "@tremor/react";
import type { Monitor, ResultStats } from "@signal-monitor/shared";
import { formatTimeAgo } from "../utils/format";

function last14Days(byDay: ResultStats["byDay"]) {
  return byDay.slice(-14).map((d) => ({ date: d.date, count: d.count }));
}

function sum14DayTotal(byDay: ResultStats["byDay"]): number {
  return byDay.slice(-14).reduce((acc, d) => acc + d.count, 0);
}

interface Props {
  monitor: Monitor;
  stats: ResultStats | undefined;
}

export default function StatsCard({ monitor, stats }: Props) {
  const sparklineData = stats ? last14Days(stats.byDay) : [];
  const total14d = stats ? sum14DayTotal(stats.byDay) : 0;

  return (
    <Card>
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">Stats</h2>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Last run</p>
          <p className="text-sm font-medium text-zinc-900">{formatTimeAgo(monitor.lastRunAt)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Last results</p>
          <p className="text-sm font-medium text-zinc-900">{monitor.lastResultCount}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Results (14d)</p>
          <p className="text-sm font-medium text-zinc-900">{total14d}</p>
        </div>
      </div>
      {sparklineData.length > 0 ? (
        <AreaChart
          data={sparklineData}
          index="date"
          categories={["count"]}
          showLegend={false}
          showXAxis
          showYAxis={false}
          showGridLines={false}
          className="h-28"
          colors={["indigo"]}
        />
      ) : (
        <p className="text-xs text-zinc-400 text-center py-4">No data yet.</p>
      )}
    </Card>
  );
}
