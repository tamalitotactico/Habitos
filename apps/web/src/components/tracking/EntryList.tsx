"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimeEntry, CATEGORY_LABELS, TimeCategory } from "@/lib/api/timeEntries";
import { useDeleteTimeEntry } from "@/lib/hooks/useTimeEntries";

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  entries: TimeEntry[];
}

export function EntryList({ entries }: Props) {
  const del = useDeleteTimeEntry();

  if (!entries.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aún no hay sesiones registradas hoy
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <div
          key={e.id}
          className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{e.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatTime(e.startedAt)} → {formatTime(e.endedAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[e.category as TimeCategory]}
            </Badge>
            <span className="text-sm font-semibold tabular-nums">
              {formatDuration(e.durationSec)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => del.mutate(e.id)}
              disabled={del.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
