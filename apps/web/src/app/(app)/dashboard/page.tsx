"use client";

import { useMemo } from "react";
import { Flame, Sparkles, Sunrise, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitRow } from "@/components/habits/HabitRow";
import { EmptyHabits } from "@/components/habits/EmptyHabits";
import { useToday } from "@/lib/hooks/useHabits";
import { useAuthStore } from "@/stores/auth.store";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function greeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return { text: `Buenos días, ${name}`, Icon: Sunrise };
  if (h < 20) return { text: `Buenas tardes, ${name}`, Icon: Sparkles };
  return { text: `Buenas noches, ${name}`, Icon: Moon };
}

function contextualMessage(done: number, total: number) {
  if (total === 0) return "Crea tu primer hábito para empezar";
  if (done === 0) return "Empieza el día con un pequeño paso";
  if (done === total) return "¡Día completo! Te lo has ganado 🎉";
  if (done / total >= 0.7) return "Estás cerca, no aflojes";
  if (done / total >= 0.3) return "Vas en buen camino";
  return "Acabas de empezar, sigue así";
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
  const progress = total ? completedCount / total : 0;
  const bestStreak = habits?.reduce((max, h) => Math.max(max, h.streak), 0) ?? 0;
  const allDone = total > 0 && completedCount === total;

  const { text: greetingText, Icon: GreetingIcon } = user
    ? greeting(user.name)
    : { text: "Hoy", Icon: Sparkles };

  // SVG circle progress
  const SIZE = 96;
  const STROKE = 8;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const offset = CIRC - progress * CIRC;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <GreetingIcon className="h-5 w-5 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greetingText}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("es", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* Hero progress */}
      {!isLoading && total > 0 && (
        <div
          className={cnHero(allDone)}
        >
          {/* Ring progress */}
          <div className="relative shrink-0">
            <svg width={SIZE} height={SIZE} className="-rotate-90">
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="currentColor"
                strokeWidth={STROKE}
                fill="none"
                className="text-muted/40"
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="currentColor"
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
                className="text-primary transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums leading-none">
                {completedCount}
              </span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">
                / {total}
              </span>
            </div>
          </div>

          {/* Message + streak */}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold leading-tight">
              {contextualMessage(completedCount, total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress * 100)}% completado hoy
            </p>
            {bestStreak > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  Tu mejor racha: {bestStreak} {bestStreak === 1 ? "día" : "días"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
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

function cnHero(allDone: boolean) {
  const base = "flex items-center gap-5 rounded-2xl border p-5 transition-colors";
  return allDone
    ? `${base} border-primary/30 bg-primary/5`
    : `${base} bg-card`;
}
