"use client";

import { useState } from "react";
import { Check, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HabitWithToday } from "@/lib/api/habits";
import { useUpsertLog } from "@/lib/hooks/useHabits";

interface Props {
  habit: HabitWithToday;
  date: string; // YYYY-MM-DD
}

export function HabitRow({ habit, date }: Props) {
  const upsert = useUpsertLog();
  const completed = habit.todayLog?.completed ?? false;
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const isCompleted = optimistic ?? completed;

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
        "group flex items-center gap-4 rounded-xl border p-4 transition-colors",
        isCompleted
          ? "border-transparent bg-primary/8"
          : "border-border bg-card hover:bg-muted/40"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={toggle}
        disabled={upsert.isPending}
        aria-label={isCompleted ? "Desmarcar" : "Marcar como hecho"}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {isCompleted && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

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
