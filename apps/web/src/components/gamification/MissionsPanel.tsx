"use client";

import { Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges } from "@/lib/hooks/useGamification";
import { ChallengeCard } from "./ChallengeCard";

export function MissionsPanel() {
  const { data: challenges, isLoading } = useChallenges();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-widest text-primary">
          <Target className="h-3.5 w-3.5" />
          Misiones activas
        </h2>
        {challenges && challenges.length > 0 && (
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {challenges.filter((c) => c.completed).length}/{challenges.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(challenges ?? []).map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </section>
  );
}
