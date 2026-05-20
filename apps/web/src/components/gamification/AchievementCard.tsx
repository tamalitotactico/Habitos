"use client";

import { Lock } from "lucide-react";
import { Achievement, AchievementRarity } from "@/lib/api/gamification";
import { AchievementIcon } from "./AchievementIcon";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<AchievementRarity, { ring: string; iconBg: string; label: string; labelColor: string }> = {
  common: {
    ring: "ring-2 ring-muted",
    iconBg: "bg-muted text-muted-foreground",
    label: "Común",
    labelColor: "text-muted-foreground",
  },
  rare: {
    ring: "ring-2 ring-primary/40",
    iconBg: "bg-primary/10 text-primary",
    label: "Raro",
    labelColor: "text-primary",
  },
  epic: {
    ring: "ring-2 ring-accent/50",
    iconBg: "bg-accent/15 text-accent-shadow",
    label: "Épico",
    labelColor: "text-accent-shadow",
  },
  legendary: {
    ring: "ring-2 ring-warning",
    iconBg: "bg-gradient-to-br from-accent to-primary text-primary-foreground",
    label: "Legendario",
    labelColor: "text-warning",
  },
};

interface Props {
  achievement: Achievement;
}

export function AchievementCard({ achievement: a }: Props) {
  const style = RARITY_STYLES[a.rarity];
  const locked = !a.unlocked;

  return (
    <div
      className={cn(
        "relative flex gap-3 rounded-2xl border-2 p-4 transition-all",
        a.unlocked
          ? `border-transparent bg-card ${style.ring} shadow-soft`
          : "border-border bg-muted/30 opacity-70"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
        a.unlocked ? style.iconBg : "bg-muted text-muted-foreground/50"
      )}>
        {locked
          ? <Lock className="h-5 w-5" />
          : <AchievementIcon name={a.icon} className="h-6 w-6" strokeWidth={2.5} />
        }
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-display text-sm font-black">{a.title}</p>
          <span className={cn(
            "shrink-0 font-display text-[10px] font-black uppercase tracking-widest",
            a.unlocked ? style.labelColor : "text-muted-foreground/60"
          )}>
            {style.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-snug">{a.description}</p>
        <p className="pt-1 text-[11px] font-bold text-accent-shadow">+{a.xpReward} XP</p>
      </div>
    </div>
  );
}
