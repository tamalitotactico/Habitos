"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateHabitDto, Habit } from "@/lib/api/habits";

interface Props {
  initial?: Partial<Habit>;
  onSubmit: (data: CreateHabitDto) => void;
  isPending?: boolean;
  onCancel?: () => void;
}

export function HabitForm({ initial, onSubmit, isPending, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"good" | "bad">(initial?.type ?? "good");
  const [frequency, setFrequency] = useState(String(initial?.frequency ?? 7));
  const [targetDuration, setTargetDuration] = useState(
    String(initial?.targetDuration ?? "")
  );
  const [trigger, setTrigger] = useState(initial?.trigger ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      type,
      frequency: Number(frequency),
      ...(targetDuration ? { targetDuration: Number(targetDuration) } : {}),
      ...(trigger ? { trigger } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre del hábito</Label>
        <Input
          id="name"
          placeholder="Ej: Meditar 10 minutos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={(v) => v && setType(v as "good" | "bad")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Cultivar</SelectItem>
              <SelectItem value="bad">Evitar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="frequency">Días/semana</Label>
          <Select value={frequency} onValueChange={(v) => v && setFrequency(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d === 7 ? "Todos los días" : `${d} días`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="duration">
          Duración objetivo{" "}
          <span className="text-muted-foreground">(minutos, opcional)</span>
        </Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={480}
          placeholder="30"
          value={targetDuration}
          onChange={(e) => setTargetDuration(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="trigger">
          Disparador{" "}
          <span className="text-muted-foreground">(¿qué lo activa? opcional)</span>
        </Label>
        <Textarea
          id="trigger"
          placeholder="Ej: Cuando me siento aburrido / Después de desayunar"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          maxLength={300}
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? "Guardando…" : initial ? "Guardar cambios" : "Crear hábito"}
        </Button>
      </div>
    </form>
  );
}
