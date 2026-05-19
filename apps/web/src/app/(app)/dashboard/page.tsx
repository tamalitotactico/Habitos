"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { HabitRow } from "@/components/habits/HabitRow";
import { EmptyHabits } from "@/components/habits/EmptyHabits";
import { useToday } from "@/lib/hooks/useHabits";
import { useAuthStore } from "@/stores/auth.store";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function greeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Buenos días, ${name}`;
  if (h < 20) return `Buenas tardes, ${name}`;
  return `Buenas noches, ${name}`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: habits, isLoading } = useToday();
  const date = todayStr();

  const { good, bad } = useMemo(() => {
    if (!habits) return { good: [], bad: [] };
    return {
      good: habits.filter((h) => h.type === "good"),
      bad: habits.filter((h) => h.type === "bad"),
    };
  }, [habits]);

  const completedCount = habits?.filter((h) => h.todayLog?.completed).length ?? 0;
  const total = habits?.length ?? 0;
  const progress = total ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user ? greeting(user.name) : "Hoy"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Progress bar */}
      {!isLoading && total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso de hoy</span>
            <span className="font-semibold">
              {completedCount}/{total}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && total === 0 && <EmptyHabits />}

      {/* Good habits */}
      {!isLoading && good.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hábitos a cultivar
          </h2>
          <div className="space-y-2">
            {good.map((h) => (
              <HabitRow key={h.id} habit={h} date={date} />
            ))}
          </div>
        </section>
      )}

      {/* Bad habits (to avoid) */}
      {!isLoading && bad.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hábitos a evitar
          </h2>
          <div className="space-y-2">
            {bad.map((h) => (
              <HabitRow key={h.id} habit={h} date={date} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
