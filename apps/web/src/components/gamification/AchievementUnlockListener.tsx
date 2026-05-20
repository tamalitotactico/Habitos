"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { usePendingAchievements, useMarkNotified } from "@/lib/hooks/useGamification";
import { AchievementIcon } from "./AchievementIcon";
import type { PendingAchievement } from "@/lib/api/gamification";

function UnlockToast({ a }: { a: PendingAchievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex w-[340px] items-center gap-3 rounded-2xl border-2 border-accent bg-card p-4 shadow-press-accent"
    >
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-primary text-primary-foreground"
      >
        <AchievementIcon name={a.icon} className="h-6 w-6" strokeWidth={2.5} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] font-black uppercase tracking-widest text-accent-shadow">
          ¡Logro desbloqueado!
        </p>
        <p className="truncate font-display text-sm font-black">{a.title}</p>
        <p className="truncate text-xs text-muted-foreground">{a.description}</p>
      </div>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 18 }}
        className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 font-display text-xs font-black text-accent-shadow"
      >
        +{a.xpReward}
      </motion.span>
    </motion.div>
  );
}

/**
 * Polls for newly-unlocked achievements and renders animated celebration toasts.
 */
export function AchievementUnlockListener() {
  const { data: pending } = usePendingAchievements();
  const mark = useMarkNotified();

  useEffect(() => {
    if (!pending || pending.length === 0) return;
    const ids: string[] = [];

    for (const a of pending) {
      ids.push(a.id);
      toast.custom(() => <UnlockToast a={a} />, { duration: 6000 });
    }

    if (ids.length > 0) mark.mutate(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return null;
}
