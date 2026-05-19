"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyEntries } from "@/lib/hooks/useTimeEntries";
import { TIME_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS, TimeCategory } from "@/lib/api/timeEntries";

function secToH(sec: number) {
  return Math.round((sec / 3600) * 10) / 10;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltipValue(value: any, name: any): [string, string] | null {
  const sec = typeof value === "number" ? value * 3600 : 0;
  if (sec === 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const catKey = String(name).replace(/H$/, "") as TimeCategory;
  const label = CATEGORY_LABELS[catKey] ?? String(name);
  return [`${h > 0 ? `${h}h ` : ""}${m}m`, label];
}

export function WeeklyChart() {
  const { data, isLoading } = useWeeklyEntries();

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  if (!data || data.days.every((d) => d.total === 0)) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sin datos esta semana
      </p>
    );
  }

  const chartData = data.days.map((d) => ({
    ...d,
    // convert to hours for the Y axis
    socialH: secToH(d.social),
    workH: secToH(d.work),
    entertainmentH: secToH(d.entertainment),
    productivityH: secToH(d.productivity),
    otherH: secToH(d.other),
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={20} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))" }}
            formatter={formatTooltipValue}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
          />
          {TIME_CATEGORIES.map((cat) => (
            <Bar
              key={cat}
              dataKey={`${cat}H`}
              stackId="a"
              fill={CATEGORY_COLORS[cat]}
              radius={cat === "other" ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {TIME_CATEGORIES.map((cat) => {
          const hasSec = data.days.some((d) => d[cat] > 0);
          if (!hasSec) return null;
          return (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              />
              {CATEGORY_LABELS[cat]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
