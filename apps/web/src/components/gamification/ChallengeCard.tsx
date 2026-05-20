"use client";

import { CheckCircle2, Clock, Zap } from "lucide-react";
import type { Challenge } from "@/lib/api/gamification";
import { AchievementIcon } from "./AchievementIcon";
import { cn } from "@/lib/utils";

interface Props {
  challenge: Challenge;
}

function timeRemaining(iso: string, type: "daily" | "weekly"): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirado";
  const hours = Math.floor(ms / 1000 / 60 / 60);
  const days = Math.floor(hours / 24);
  if (type === "weekly" && days >= 1) return `${days}d restante${days !== 1 ? "s" : ""}`;
  if (hours >= 1) return `${hours}h restante${hours !== 1 ? "s" : ""}`;
  const minutes = Math.floor(ms / 1000 / 60);
  return `${minutes}m restante${minutes !== 1 ? "s" : ""}`;
}

export function ChallengeCard({ challenge: c }: Props) {
  const typeBadge = c.type === "daily" ? "Diario" : "Semanal";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-4 transition-all",
        c.completed
          ? "border-success/40 bg-success/8"
          : "border-border bg-card hover:-translate-y-px hover:shadow-soft hover:border-primary/30"
      )}
    >
      {/* Subtle glow when completed */}
      {c.completed && (
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-success/15 blur-2xl" />
      )}

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            c.completed
              ? "bg-success text-primary-foreground"
              : c.type === "daily"
                ? "bg-primary/10 text-primary"
                : "bg-accent/15 text-accent-shadow"
          )}
        >
          {c.completed
            ? <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
            : <AchievementIcon name={c.challenge.icon} className="h-6 w-6" strokeWidth={2.5} />
          }
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "rounded-full border px-1.5 py-0 font-display text-[9px] font-black uppercase tracking-widest",
              c.type === "daily"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-accent/30 bg-accent/10 text-accent-shadow"
            )}>
              {typeBadge}
            </span>
            <span className="font-display text-[10px] font-bold text-accent-shadow">
              +{c.challenge.xpReward} XP
            </span>
          </div>

          <p className="font-display text-sm font-black leading-tight">{c.challenge.title}</p>
          <p className="text-xs text-muted-foreground leading-snug">{c.challenge.description}</p>

          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-bold tabular-nums">
              <span className={c.completed ? "text-success" : "text-foreground"}>
                {c.progress} / {c.goal}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {timeRemaining(c.expiresAt, c.type)}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  c.completed
                    ? "bg-gradient-to-r from-success to-primary"
                    : "bg-gradient-to-r from-primary to-accent"
                )}
                style={{ width: `${Math.max(2, c.percent)}%` }}
              />
            </div>
          </div>

          {c.completed && (
            <p className="flex items-center gap-1 pt-1 text-[11px] font-bold text-success">
              <Zap className="h-3 w-3" fill="currentColor" />
              ¡Reto cumplido!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
