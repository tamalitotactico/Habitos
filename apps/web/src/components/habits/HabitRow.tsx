"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Flame, Clock, Shield, Sprout, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HabitWithToday } from "@/lib/api/habits";
import { useUpsertLog } from "@/lib/hooks/useHabits";

interface Props {
  habit: HabitWithToday;
  date: string;
}

export function HabitRow({ habit, date }: Props) {
  const upsert = useUpsertLog();
  const completed = habit.todayLog?.completed ?? false;
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const isCompleted = optimistic ?? completed;
  const isBad = habit.type === "bad";

  const [justCompleted, setJustCompleted] = useState(false);
  const prevCompleted = useRef(isCompleted);

  useEffect(() => {
    if (!prevCompleted.current && isCompleted) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 900);
      return () => clearTimeout(t);
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted]);

  function toggle() {
    const next = !isCompleted;
    setOptimistic(next);
    upsert.mutate(
      { habitId: habit.id, date, completed: next },
      { onError: () => setOptimistic(null) }
    );
  }

  // Visual identity differs sharply between good and bad
  const tokens = isBad
    ? {
        // Bad habit = "challenge to overcome" — warm orange/warning, NEVER destructive red
        baseBorder: "border-warning/40 bg-card",
        hoverBorder: "hover:border-warning/70",
        completedBorder: "border-warning/40 bg-warning/8",
        checkboxIdle: "border-warning/40 hover:border-warning hover:bg-warning/10",
        checkboxDone: "border-transparent bg-warning text-accent-foreground shadow-[0_4px_0_0_var(--accent-shadow)] hover:-translate-y-px hover:shadow-[0_5px_0_0_var(--accent-shadow)] active:translate-y-1 active:shadow-none",
        chipIcon: Shield,
        chipText: "evitar",
        chipClass: "bg-warning/15 text-accent-foreground border-warning/20",
        xpAmount: "+15 XP",
      }
    : {
        baseBorder: "border-border bg-card",
        hoverBorder: "hover:border-primary/40",
        completedBorder: "border-primary/30 bg-primary/8",
        checkboxIdle: "border-muted-foreground/30 hover:border-primary hover:bg-primary/10",
        checkboxDone: "border-transparent bg-primary text-primary-foreground shadow-press hover:-translate-y-px hover:shadow-[0_5px_0_0_var(--primary-shadow)] active:translate-y-1 active:shadow-none",
        chipIcon: Sprout,
        chipText: "cultivar",
        chipClass: "bg-primary/10 text-primary border-primary/20",
        xpAmount: "+10 XP",
      };

  const ChipIcon = tokens.chipIcon;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all",
        isCompleted ? tokens.completedBorder : `${tokens.baseBorder} hover:-translate-y-px hover:shadow-soft ${tokens.hoverBorder}`
      )}
    >
      {/* Checkbox button with press-depth + animations */}
      <button
        onClick={toggle}
        disabled={upsert.isPending}
        aria-label={isCompleted ? "Desmarcar" : "Marcar como hecho"}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-100",
          isCompleted ? tokens.checkboxDone : tokens.checkboxIdle,
          justCompleted && "animate-habit-pop"
        )}
      >
        {justCompleted && (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ring-pulse" />
        )}
        {isCompleted && <Check className="h-5 w-5" strokeWidth={3.5} />}
      </button>

      {/* Floating +XP indicator */}
      {justCompleted && (
        <span className="pointer-events-none absolute left-9 top-2 flex items-center gap-0.5 text-xs font-black text-accent-shadow animate-streak-float">
          <Zap className="h-3 w-3 fill-current" />
          {tokens.xpAmount}
        </span>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ChipIcon className={cn("h-3.5 w-3.5 shrink-0", isBad ? "text-warning" : "text-primary")} />
          <p
            className={cn(
              "truncate font-display font-bold leading-tight transition-colors",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {habit.name}
          </p>
        </div>
        {habit.trigger && (
          <p className="mt-0.5 ml-5 truncate text-xs text-muted-foreground">
            Disparador: {habit.trigger}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex shrink-0 items-center gap-2">
        {habit.targetDuration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {habit.targetDuration}m
          </span>
        )}
        {habit.streak > 0 && (
          <Badge
            variant="secondary"
            className="gap-1 px-1.5 py-0.5 text-xs font-semibold"
          >
            <Flame className="h-3 w-3 text-orange-500" />
            {habit.streak}
          </Badge>
        )}
        <span className={cn(
          "hidden rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider sm:inline-flex",
          tokens.chipClass
        )}>
          {tokens.chipText}
        </span>
      </div>
    </div>
  );
}
