"use client";

import { useState } from "react";
import { Pencil, Archive, Flame, TrendingUp, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Habit } from "@/lib/api/habits";
import { HabitForm } from "./HabitForm";
import { useUpdateHabit, useArchiveHabit } from "@/lib/hooks/useHabits";

interface Props {
  habit: Habit & { adherence: number };
}

export function HabitCard({ habit }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const update = useUpdateHabit();
  const archive = useArchiveHabit();

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          {/* Main info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">{habit.name}</span>
              <Badge
                variant={habit.type === "good" ? "secondary" : "destructive"}
                className="shrink-0 text-[10px]"
              >
                {habit.type === "good" ? "cultivar" : "evitar"}
              </Badge>
            </div>

            {habit.trigger && (
              <p className="text-xs text-muted-foreground">
                Disparador: {habit.trigger}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {habit.streak} días de racha
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {habit.adherence}% adherencia
              </span>
              <span>{habit.frequency}×/sem</span>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => archive.mutate(habit.id)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar hábito</DialogTitle>
          </DialogHeader>
          <HabitForm
            initial={habit}
            isPending={update.isPending}
            onCancel={() => setEditOpen(false)}
            onSubmit={(data) =>
              update.mutate(
                { id: habit.id, data },
                { onSuccess: () => setEditOpen(false) }
              )
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
