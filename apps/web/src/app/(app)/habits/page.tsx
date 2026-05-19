"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { EmptyHabits } from "@/components/habits/EmptyHabits";
import { useHabits, useCreateHabit } from "@/lib/hooks/useHabits";

export default function HabitsPage() {
  const [open, setOpen] = useState(false);
  const { data: habits, isLoading } = useHabits();
  const create = useCreateHabit();

  const good = habits?.filter((h) => h.type === "good") ?? [];
  const bad = habits?.filter((h) => h.type === "bad") ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis hábitos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus hábitos activos
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo hábito</DialogTitle>
            </DialogHeader>
            <HabitForm
              isPending={create.isPending}
              onCancel={() => setOpen(false)}
              onSubmit={(data) =>
                create.mutate(data, { onSuccess: () => setOpen(false) })
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !habits?.length && <EmptyHabits />}

      {/* Good habits */}
      {!isLoading && good.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hábitos a cultivar
          </h2>
          <div className="space-y-2">
            {good.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        </section>
      )}

      {/* Bad habits */}
      {!isLoading && bad.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Hábitos a evitar
          </h2>
          <div className="space-y-2">
            {bad.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
