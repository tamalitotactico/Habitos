"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { usePendingAchievements, useMarkNotified } from "@/lib/hooks/useGamification";
import { AchievementIcon } from "./AchievementIcon";

/**
 * Polls for newly-unlocked achievements (set via the habit log API) and renders
 * them as celebration toasts. Mounted globally in the app layout.
 */
export function AchievementUnlockListener() {
  const { data: pending } = usePendingAchievements();
  const mark = useMarkNotified();

  useEffect(() => {
    if (!pending || pending.length === 0) return;
    const ids: string[] = [];

    for (const a of pending) {
      ids.push(a.id);
      toast.custom(
        () => (
          <div className="flex w-[340px] items-center gap-3 rounded-2xl border-2 border-accent bg-card p-4 shadow-press-accent">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary text-primary-foreground">
              <AchievementIcon name={a.icon} className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] font-black uppercase tracking-widest text-accent-shadow">
                ¡Logro desbloqueado!
              </p>
              <p className="truncate font-display text-sm font-black">{a.title}</p>
              <p className="truncate text-xs text-muted-foreground">{a.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 font-display text-xs font-black text-accent-shadow">
              +{a.xpReward}
            </span>
          </div>
        ),
        { duration: 6000 }
      );
    }

    if (ids.length > 0) mark.mutate(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return null;
}
