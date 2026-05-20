"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendar } from "@/lib/hooks/useGamification";
import type { CalendarDay } from "@/lib/api/gamification";
import { cn } from "@/lib/utils";

// 5 intensity levels mapped to primary opacity
function intensityClass(ratio: number, total: number): string {
  if (total === 0) return "bg-muted/30";
  if (ratio === 0)    return "bg-muted/50";
  if (ratio < 0.25)   return "bg-primary/25";
  if (ratio < 0.50)   return "bg-primary/45";
  if (ratio < 0.75)   return "bg-primary/70";
  if (ratio < 1)      return "bg-primary/90";
  return "bg-primary";
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function tooltip(day: CalendarDay): string {
  const d = new Date(day.date + "T12:00:00");
  const date = d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });
  if (day.total === 0) return `${date} · sin hábitos activos`;
  return `${date} · ${day.completed}/${day.total} completados`;
}

export function StreakCalendar() {
  const { data: days, isLoading } = useCalendar();

  // Arrange into columns of weeks (left-to-right = oldest-to-newest, top-to-bottom = Mon-Sun)
  const weeks = useMemo(() => {
    if (!days) return [];
    const cols: (CalendarDay | null)[][] = [];
    let current: (CalendarDay | null)[] = new Array(7).fill(null);

    days.forEach((d, i) => {
      const date = new Date(d.date + "T12:00:00");
      const dow = (date.getDay() + 6) % 7; // Mon=0, Sun=6
      current[dow] = d;
      // Push when Sunday (last day of week) reached, OR last item
      if (dow === 6 || i === days.length - 1) {
        cols.push(current);
        current = new Array(7).fill(null);
      }
    });

    // If first column has dow > 0, pad with null at the start so days line up
    return cols;
  }, [days]);

  const totalCompletedDays = (days ?? []).filter((d) => d.completed > 0).length;
  const totalActiveDays = (days ?? []).filter((d) => d.total > 0).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-widest text-primary">
          <CalendarDays className="h-3.5 w-3.5" />
          Calendario de constancia
        </h2>
        {days && (
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {totalCompletedDays}/{totalActiveDays} días
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 bg-card p-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (
          <div className="flex items-start gap-3">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pt-0">
              {DAY_LABELS.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-3.5 w-3 text-[9px] font-bold leading-3.5 text-muted-foreground",
                    i % 2 === 1 ? "opacity-0" : "opacity-100"
                  )}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Heatmap columns */}
            <div className="flex gap-[3px]">
              {weeks.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-[3px]">
                  {col.map((cell, ri) => (
                    <div
                      key={ri}
                      title={cell ? tooltip(cell) : ""}
                      className={cn(
                        "h-3.5 w-3.5 rounded-[3px]",
                        cell ? intensityClass(cell.ratio, cell.total) : "bg-transparent"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        {!isLoading && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Menos</span>
            <div className="flex gap-[3px]">
              <div className="h-3 w-3 rounded-[3px] bg-muted/50" />
              <div className="h-3 w-3 rounded-[3px] bg-primary/25" />
              <div className="h-3 w-3 rounded-[3px] bg-primary/45" />
              <div className="h-3 w-3 rounded-[3px] bg-primary/70" />
              <div className="h-3 w-3 rounded-[3px] bg-primary/90" />
              <div className="h-3 w-3 rounded-[3px] bg-primary" />
            </div>
            <span>Más</span>
          </div>
        )}
      </div>
    </section>
  );
}
