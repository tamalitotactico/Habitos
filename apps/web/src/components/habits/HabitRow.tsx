"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Flame, Clock } from "lucide-react";
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

  // Trigger animation when transitioning to completed
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

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all",
        isCompleted
          ? "border-primary/30 bg-primary/8"
          : "border-border bg-card hover:-translate-y-px hover:border-primary/30 hover:shadow-soft"
      )}
    >
      {/* Checkbox button with press-depth + animations */}
      <button
        onClick={toggle}
        disabled={upsert.isPending}
        aria-label={isCompleted ? "Desmarcar" : "Marcar como hecho"}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-100",
          isCompleted
            ? "border-transparent bg-primary text-primary-foreground shadow-press hover:-translate-y-px hover:shadow-[0_5px_0_0_var(--primary-shadow)] active:translate-y-1 active:shadow-none"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10 active:scale-95",
          justCompleted && "animate-habit-pop"
        )}
      >
        {/* Ring pulse on complete */}
        {justCompleted && (
          <span className="pointer-events-none absolute inset-0 rounded-full animate-ring-pulse" />
        )}
        {isCompleted && <Check className="h-5 w-5" strokeWidth={3.5} />}
      </button>

      {/* Streak +1 floater */}
      {justCompleted && habit.streak > 0 && (
        <span className="pointer-events-none absolute left-9 top-2 flex items-center gap-0.5 text-xs font-bold text-orange-500 animate-streak-float">
          <Flame className="h-3 w-3" />
          +1
        </span>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium leading-tight transition-colors",
            isCompleted && "text-muted-foreground line-through"
          )}
        >
          {habit.name}
        </p>
        {habit.trigger && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
        <Badge
          variant={habit.type === "good" ? "secondary" : "destructive"}
          className="hidden text-[10px] sm:inline-flex"
        >
          {habit.type === "good" ? "bueno" : "evitar"}
        </Badge>
      </div>
    </div>
  );
}
