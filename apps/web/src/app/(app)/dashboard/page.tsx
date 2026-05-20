"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Flame, Sunrise, Sun, Moon, Trophy, Snowflake } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitRow } from "@/components/habits/HabitRow";
import { EmptyHabits } from "@/components/habits/EmptyHabits";
import { SproutMascot } from "@/components/SproutMascot";
import { Confetti } from "@/components/Confetti";
import { ParticleBackground } from "@/components/ParticleBackground";
import { XPBar } from "@/components/gamification/XPBar";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { MissionsPanel } from "@/components/gamification/MissionsPanel";
import { MotivationMessage, pickMood } from "@/components/MotivationMessage";
import { useToday } from "@/lib/hooks/useHabits";
import { useStats } from "@/lib/hooks/useGamification";
import { useAuthStore } from "@/stores/auth.store";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

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
  const { data: stats } = useStats();
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
  const bestStreak = stats?.currentDailyStreak ?? habits?.reduce((max, h) => Math.max(max, h.streak), 0) ?? 0;
  const allDone = total > 0 && completedCount === total;

  // Confetti on day complete
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

  // Bump streak on increase
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
        {/* Hero — garden card with gamification */}
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2rem] border-2 border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.05] p-6 shadow-soft"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

          {/* Ambient floating particles */}
          <ParticleBackground className="pointer-events-none absolute inset-0" />

          {/* Top row: mascot + greeting + level */}
          <div className="relative flex items-start gap-5">
            {isLoading ? (
              <Skeleton className="h-32 w-32 rounded-3xl shrink-0" />
            ) : (
              <div className="shrink-0">
                <SproutMascot streak={bestStreak} className="h-32 w-32" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <GreetingIcon className="h-4 w-4 text-accent-shadow" />
                <span className="font-display text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {greetingLabel}
                </span>
              </div>

              <h1 className="font-display text-xl font-black leading-tight">
                {isLoading ? <Skeleton className="h-7 w-48" /> : plantStageMsg(bestStreak, userName)}
              </h1>

              {/* Streak + Level row */}
              {!isLoading && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 shadow-press-accent">
                    <Flame className="h-4 w-4 text-accent-foreground" strokeWidth={2.5} fill="currentColor" />
                    <span
                      className={`font-display text-base font-black tabular-nums text-accent-foreground ${
                        streakBump ? "animate-streak-bump" : ""
                      }`}
                    >
                      {bestStreak}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-accent-foreground/80">
                      {bestStreak === 1 ? "día" : "días"}
                    </span>
                  </div>

                  {stats && <LevelBadge level={stats.level} size="sm" />}

                  {stats && stats.streakFreezesAvailable > 0 && (
                    <div
                      title="Si pierdes un día, se conserva tu racha automáticamente"
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                    >
                      <Snowflake className="h-3 w-3 text-blue-500" />
                      {stats.streakFreezesAvailable}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* XP bar */}
          {stats && (
            <div className="relative mt-5 rounded-2xl bg-card/60 backdrop-blur p-3 border border-border/60">
              <XPBar
                xpInLevel={stats.xpInLevel}
                xpForNextLevel={stats.xpForNextLevel}
                percent={stats.percentToNextLevel}
                size="sm"
              />
            </div>
          )}

          {/* Daily progress strip */}
          {!isLoading && total > 0 && (
            <div className="relative mt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm font-black">
                  {progressMsg(completedCount, total)}
                </span>
                <span className="font-display text-sm font-black tabular-nums text-primary">
                  {completedCount}<span className="text-muted-foreground">/{total}</span>
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-success to-primary transition-all duration-700 ease-out"
                  style={{ width: `${(completedCount / total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick achievements link */}
          {stats && (
            <Link
              href="/achievements"
              className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <Trophy className="h-3.5 w-3.5" />
              Ver mis logros
            </Link>
          )}
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && total === 0 && <EmptyHabits />}

        {/* Emotional motivation strip */}
        {!isLoading && total > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
            <MotivationMessage mood={pickMood({ completed: completedCount, total, streak: bestStreak })} />
          </motion.div>
        )}

        {/* Missions / Challenges */}
        {!isLoading && total > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}>
            <MissionsPanel />
          </motion.div>
        )}

        {!isLoading && good.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }} className="space-y-3">
            <h2 className="font-display text-xs font-black uppercase tracking-widest text-primary">
              🌱 A cultivar
            </h2>
            <div className="space-y-2">
              {good.map((h) => (
                <HabitRow key={h.id} habit={h} date={date} />
              ))}
            </div>
          </motion.section>
        )}

        {!isLoading && bad.length > 0 && (
          <motion.section {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }} className="space-y-3">
            <h2 className="font-display text-xs font-black uppercase tracking-widest text-warning">
              💪 A superar
            </h2>
            <div className="space-y-2">
              {bad.map((h) => (
                <HabitRow key={h.id} habit={h} date={date} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </>
  );
}
