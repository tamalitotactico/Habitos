"use client";

import { useMemo } from "react";
import { Trophy, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { XPBar } from "@/components/gamification/XPBar";
import { useAchievements, useStats } from "@/lib/hooks/useGamification";
import { Achievement, AchievementCategory } from "@/lib/api/gamification";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  completion:  "Completitud",
  streak:      "Constancia",
  consistency: "Disciplina",
  balance:     "Balance",
};

const CATEGORY_ORDER: AchievementCategory[] = ["completion", "streak", "consistency", "balance"];

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useAchievements();
  const { data: stats } = useStats();

  const grouped = useMemo(() => {
    const result = new Map<AchievementCategory, Achievement[]>();
    for (const cat of CATEGORY_ORDER) result.set(cat, []);
    for (const a of achievements ?? []) result.get(a.category)?.push(a);
    return result;
  }, [achievements]);

  const totalUnlocked = (achievements ?? []).filter((a) => a.unlocked).length;
  const totalCount = achievements?.length ?? 0;
  const unlockPercent = totalCount > 0 ? Math.round((totalUnlocked / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight">Logros</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cada acción te acerca al siguiente.
          </p>
        </div>
        <Trophy className="h-6 w-6 text-accent" />
      </div>

      {/* Summary */}
      {stats && (
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-accent/20 bg-gradient-to-br from-accent/[0.06] via-card to-primary/[0.06] p-5 shadow-soft">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <LevelBadge level={stats.level} size="lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="font-display text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Nivel
                </p>
                <p className="font-display text-2xl font-black leading-none">
                  {stats.level}
                </p>
              </div>
              <XPBar
                xpInLevel={stats.xpInLevel}
                xpForNextLevel={stats.xpForNextLevel}
                percent={stats.percentToNextLevel}
                size="sm"
              />
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Logros" value={`${totalUnlocked}/${totalCount}`} sub={`${unlockPercent}%`} />
            <Stat label="Racha" value={stats.currentDailyStreak} sub={`mejor: ${stats.longestDailyStreak}`} />
            <Stat label="Total" value={stats.lifetimeCompletions} sub="hábitos" />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Categories */}
      {!isLoading && achievements && (
        <div className="space-y-6">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? [];
            if (list.length === 0) return null;
            const catUnlocked = list.filter((a) => a.unlocked).length;
            return (
              <section key={cat} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xs font-black uppercase tracking-widest text-primary">
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {catUnlocked}/{list.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((a) => (
                    <AchievementCard key={a.key} achievement={a} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!achievements || achievements.length === 0) && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-12 text-center">
          <Award className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-sm font-bold">No hay logros aún</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="rounded-xl bg-card/60 backdrop-blur border border-border/60 p-2">
      <p className="font-display text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-lg font-black tabular-nums leading-none mt-1">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
