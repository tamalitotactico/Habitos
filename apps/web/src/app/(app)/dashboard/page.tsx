"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Sunrise, Sun, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitRow } from "@/components/habits/HabitRow";
import { EmptyHabits } from "@/components/habits/EmptyHabits";
import { SproutMascot } from "@/components/SproutMascot";
import { Confetti } from "@/components/Confetti";
import { useToday } from "@/lib/hooks/useHabits";
import { useAuthStore } from "@/stores/auth.store";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function timeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return { label: "Buenos días", Icon: Sunrise };
  if (h < 20) return { label: "Buenas tardes", Icon: Sun };
  return { label: "Buenas noches", Icon: Moon };
}

function plantStageMsg(streak: number, name: string) {
  if (streak === 0) return `Tu jardín te espera, ${name}`;
  if (streak < 4)  return `Tu brote es joven. Mímalo, ${name}`;
  if (streak < 10) return `Tu planta crece firme, ${name}`;
  if (streak < 30) return `Una planta sana. Sigue regándola`;
  return `Tu jardín florece, ${name} 🌸`;
}

function progressMsg(done: number, total: number) {
  if (total === 0) return "Aún no plantas nada hoy";
  if (done === 0) return "Empieza con uno pequeño";
  if (done === total) return "¡Día completo!";
  if (done / total >= 0.7) return "Casi terminas, no aflojes";
  if (done / total >= 0.3) return "Vas en buen camino";
  return "Acabas de empezar";
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
  const bestStreak = habits?.reduce((max, h) => Math.max(max, h.streak), 0) ?? 0;
  const allDone = total > 0 && completedCount === total;

  // Trigger confetti once when day reaches 100%
  const [celebrate, setCelebrate] = useState(false);
  const wasAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !wasAllDone.current) {
      setCelebrate(true);
      wasAllDone.current = true;
      const t = setTimeout(() => setCelebrate(false), 3500);
      return () => clearTimeout(t);
    }
    if (!allDone) wasAllDone.current = false;
  }, [allDone]);

  // Bump streak when changes
  const [streakBump, setStreakBump] = useState(false);
  const prevStreak = useRef(bestStreak);
  useEffect(() => {
    if (bestStreak > prevStreak.current) {
      setStreakBump(true);
      const t = setTimeout(() => setStreakBump(false), 700);
      return () => clearTimeout(t);
    }
    prevStreak.current = bestStreak;
  }, [bestStreak]);

  const { label: greetingLabel, Icon: GreetingIcon } = timeOfDay();
  const userName = user?.name?.split(" ")[0] ?? "amigo";

  return (
    <>
      <Confetti show={celebrate} />

      <div className="space-y-6">
        {/* Hero — garden card */}
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-primary/15 bg-gradient-to-br from-primary/[0.05] via-background to-accent/[0.04] p-6 shadow-soft">
          {/* Decorative leaves background */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative flex items-start gap-5">
            {/* Mascot */}
            {isLoading ? (
              <Skeleton className="h-32 w-32 rounded-3xl shrink-0" />
            ) : (
              <div className="shrink-0">
                <SproutMascot streak={bestStreak} className="h-32 w-32" />
              </div>
            )}

            {/* Greeting + streak */}
            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <GreetingIcon className="h-4 w-4 text-accent-shadow" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {greetingLabel}
                </span>
              </div>

              <h1 className="font-display text-2xl font-black leading-tight text-foreground">
                {isLoading ? <Skeleton className="h-7 w-48" /> : plantStageMsg(bestStreak, userName)}
              </h1>

              {/* Streak pill — big and proud */}
              {!isLoading && (
                <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 shadow-press-accent">
                  <Flame className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} fill="currentColor" />
                  <span
                    className={`font-display text-xl font-black tabular-nums text-accent-foreground ${
                      streakBump ? "animate-streak-bump" : ""
                    }`}
                  >
                    {bestStreak}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80">
                    {bestStreak === 1 ? "día" : "días"} de racha
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress strip at bottom */}
          {!isLoading && total > 0 && (
            <div className="relative mt-6 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm font-bold text-foreground">
                  {progressMsg(completedCount, total)}
                </span>
                <span className="font-display text-sm font-black tabular-nums text-primary">
                  {completedCount}<span className="text-muted-foreground">/{total}</span>
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-700 ease-out"
                  style={{ width: `${(completedCount / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && total === 0 && <EmptyHabits />}

        {/* Good habits */}
        {!isLoading && good.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-xs font-black uppercase tracking-widest text-primary">
              🌱 A cultivar
            </h2>
            <div className="space-y-2">
              {good.map((h) => (
                <HabitRow key={h.id} habit={h} date={date} />
              ))}
            </div>
          </section>
        )}

        {/* Bad habits */}
        {!isLoading && bad.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-display text-xs font-black uppercase tracking-widest text-destructive">
              🚫 A evitar
            </h2>
            <div className="space-y-2">
              {bad.map((h) => (
                <HabitRow key={h.id} habit={h} date={date} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
