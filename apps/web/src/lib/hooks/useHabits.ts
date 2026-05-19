"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { habitsApi, CreateHabitDto, UpdateHabitDto, UpsertLogDto } from "@/lib/api/habits";

export const HABITS_KEY = ["habits"] as const;
export const TODAY_KEY = ["habits", "today"] as const;

export function useToday() {
  return useQuery({
    queryKey: TODAY_KEY,
    queryFn: () => habitsApi.getToday().then((r) => r.data.habits),
  });
}

export function useHabits(includeArchived = false) {
  return useQuery({
    queryKey: [...HABITS_KEY, { includeArchived }],
    queryFn: () => habitsApi.getAll(includeArchived).then((r) => r.data.habits),
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHabitDto) => habitsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success("Hábito creado");
    },
    onError: () => toast.error("Error al crear el hábito"),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitDto }) =>
      habitsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success("Hábito actualizado");
    },
    onError: () => toast.error("Error al actualizar el hábito"),
  });
}

export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success("Hábito archivado");
    },
    onError: () => toast.error("Error al archivar el hábito"),
  });
}

export function useUpsertLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertLogDto) => habitsApi.upsertLog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODAY_KEY });
    },
    onError: () => toast.error("Error al registrar el hábito"),
  });
}
