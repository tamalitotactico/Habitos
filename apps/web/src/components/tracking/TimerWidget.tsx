"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useTimerStore,
  getElapsedSec,
} from "@/stores/timer.store";
import {
  TIME_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  TimeCategory,
} from "@/lib/api/timeEntries";
import { useCreateTimeEntry, useTimeLabels } from "@/lib/hooks/useTimeEntries";
import { toast } from "sonner";

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerWidget() {
  const { status, label, category, start, pause, resume, stop } = useTimerStore();
  const timerState = useTimerStore();
  const [elapsed, setElapsed] = useState(0);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftCategory, setDraftCategory] = useState<TimeCategory>("productivity");
  const create = useCreateTimeEntry();
  const { data: recentLabels } = useTimeLabels();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setElapsed(getElapsedSec(timerState));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(getElapsedSec(timerState));
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, timerState]);

  function handleStart() {
    if (!draftLabel.trim()) {
      toast.error("Escribe una etiqueta antes de iniciar");
      return;
    }
    start(draftLabel.trim(), draftCategory);
  }

  function handleStop() {
    const result = stop();
    if (!result) return;
    create.mutate(
      { ...result, source: "timer" },
      { onSuccess: () => toast.success(`Sesión guardada — ${formatTime(result.durationSec)}`) }
    );
  }

  function pickRecent(rec: { label: string; category: TimeCategory }) {
    setDraftLabel(rec.label);
    setDraftCategory(rec.category);
  }

  const isIdle = status === "idle";
  const isRunning = status === "running";
  const isPaused = status === "paused";

  // Show only top 4 most-recent distinct labels
  const chips = (recentLabels ?? []).slice(0, 4);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-4 transition-all",
        isRunning && "border-primary/40 bg-primary/5 animate-timer-glow",
        isPaused && "border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/20"
      )}
    >
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isRunning && "animate-pulse bg-primary",
            isPaused && "bg-amber-400",
            isIdle && "bg-muted-foreground/30"
          )} />
          <span className="text-sm font-medium">
            {isIdle ? "Cronómetro" : isRunning ? "Registrando…" : "En pausa"}
          </span>
        </div>
        {isIdle && (
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
            <Info className="h-3 w-3" />
            Mide en qué inviertes tu tiempo
          </span>
        )}
      </div>

      {/* Clock display */}
      <div className="text-center py-2">
        <span className={cn(
          "font-mono font-bold tabular-nums tracking-tighter transition-all",
          isIdle ? "text-4xl text-muted-foreground/40" : "text-6xl",
        )}>
          {formatTime(elapsed)}
        </span>
        {isIdle && (
          <p className="mt-2 text-xs text-muted-foreground sm:hidden">
            Mide en qué inviertes tu tiempo
          </p>
        )}
      </div>

      {/* Label + category — editable only when idle */}
      <div className="space-y-2">
        {isIdle ? (
          <>
            <Input
              placeholder="¿En qué estás trabajando?"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              maxLength={100}
              className="text-base"
            />

            {/* Quick-pick chips from recent labels */}
            {chips.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Recientes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((rec) => (
                    <button
                      key={rec.label}
                      onClick={() => pickRecent(rec)}
                      className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[rec.category] }}
                      />
                      <span className="truncate max-w-[140px]">{rec.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Select
              value={draftCategory}
              onValueChange={(v) => v && setDraftCategory(v as TimeCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category as TimeCategory] }}
            />
            <span className="truncate font-medium">{label}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {CATEGORY_LABELS[category as TimeCategory]}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {isIdle && (
          <Button className="flex-1 gap-2" onClick={handleStart}>
            <Play className="h-4 w-4" />
            Iniciar sesión
          </Button>
        )}
        {isRunning && (
          <>
            <Button variant="outline" className="flex-1 gap-2" onClick={pause}>
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={handleStop}
              disabled={create.isPending}
            >
              <Square className="h-4 w-4" />
              Detener
            </Button>
          </>
        )}
        {isPaused && (
          <>
            <Button className="flex-1 gap-2" onClick={resume}>
              <Play className="h-4 w-4" />
              Reanudar
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleStop}
              disabled={create.isPending}
            >
              <Square className="h-4 w-4" />
              Guardar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
