"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIME_CATEGORIES,
  CATEGORY_LABELS,
  TimeCategory,
} from "@/lib/api/timeEntries";
import { useCreateTimeEntry, useTimeLabels } from "@/lib/hooks/useTimeEntries";
import { toast } from "sonner";

interface Props {
  onSuccess?: () => void;
}

export function ManualEntryForm({ onSuccess }: Props) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<TimeCategory>("productivity");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: labels } = useTimeLabels();
  const create = useCreateTimeEntry();

  const filtered = labels?.filter((l) =>
    l.label.toLowerCase().includes(label.toLowerCase())
  ).slice(0, 5) ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const durationSec = (Number(hours) * 3600) + (Number(minutes) * 60);
    if (durationSec <= 0) {
      toast.error("La duración debe ser mayor a 0");
      return;
    }
    if (!label.trim()) {
      toast.error("Escribe una etiqueta");
      return;
    }

    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - durationSec * 1000);

    create.mutate(
      {
        label: label.trim(),
        category,
        durationSec,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        source: "manual",
      },
      {
        onSuccess: () => {
          toast.success("Sesión registrada");
          setLabel("");
          setHours("0");
          setMinutes("30");
          onSuccess?.();
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label with autocomplete */}
      <div className="space-y-1.5 relative">
        <Label>¿Qué hiciste?</Label>
        <Input
          placeholder="Ej: Estudiar TypeScript"
          value={label}
          onChange={(e) => { setLabel(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          maxLength={100}
          required
        />
        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && label.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border bg-popover shadow-md overflow-hidden">
            {filtered.map((s) => (
              <button
                key={s.label}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                onMouseDown={() => {
                  setLabel(s.label);
                  setCategory(s.category as TimeCategory);
                  setShowSuggestions(false);
                }}
              >
                <span>{s.label}</span>
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[s.category as TimeCategory]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Categoría</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v as TimeCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label>Duración</Label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground shrink-0">h</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground shrink-0">min</span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? "Guardando…" : "Registrar sesión"}
      </Button>
    </form>
  );
}
