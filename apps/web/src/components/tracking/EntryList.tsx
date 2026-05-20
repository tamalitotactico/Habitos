"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TimeEntry,
  CATEGORY_LABELS,
  TIME_CATEGORIES,
  TimeCategory,
} from "@/lib/api/timeEntries";
import { useDeleteTimeEntry, useUpdateTimeEntry } from "@/lib/hooks/useTimeEntries";

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

function EntryRow({ entry }: { entry: TimeEntry }) {
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(entry.label);
  const [draftCategory, setDraftCategory] = useState<TimeCategory>(entry.category);
  const del = useDeleteTimeEntry();
  const upd = useUpdateTimeEntry();

  function handleSave() {
    if (!draftLabel.trim()) return;
    upd.mutate(
      { id: entry.id, data: { label: draftLabel.trim(), category: draftCategory } },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleCancel() {
    setDraftLabel(entry.label);
    setDraftCategory(entry.category);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border bg-card px-4 py-3 space-y-2">
        <Input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          maxLength={100}
          autoFocus
          className="h-8 text-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={draftCategory}
            onValueChange={(v) => v && setDraftCategory(v as TimeCategory)}
          >
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary"
            onClick={handleSave}
            disabled={upd.isPending}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleCancel}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{entry.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatTime(entry.startedAt)} → {formatTime(entry.endedAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {CATEGORY_LABELS[entry.category as TimeCategory]}
        </Badge>
        <span className="text-sm font-semibold tabular-nums">
          {formatDuration(entry.durationSec)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => del.mutate(entry.id)}
          disabled={del.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function EntryList({ entries }: Props) {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center">
        <p className="text-sm font-medium">El día está por estrenarse</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Tu primera sesión aparecerá aquí en cuanto inicies el cronómetro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <EntryRow key={e.id} entry={e} />
      ))}
    </div>
  );
}
