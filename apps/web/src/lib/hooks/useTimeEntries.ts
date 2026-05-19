"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { timeEntriesApi, CreateTimeEntryDto, UpdateTimeEntryDto } from "@/lib/api/timeEntries";

export const TODAY_TIME_KEY = ["time-entries", "today"] as const;
const WEEKLY_TIME_KEY = ["time-entries", "weekly"] as const;
const LABELS_KEY = ["time-entries", "labels"] as const;

export function useTodayEntries() {
  return useQuery({
    queryKey: TODAY_TIME_KEY,
    queryFn: () => timeEntriesApi.getToday().then((r) => r.data),
  });
}

export function useWeeklyEntries() {
  return useQuery({
    queryKey: WEEKLY_TIME_KEY,
    queryFn: () => timeEntriesApi.getWeekly().then((r) => r.data),
    staleTime: 60 * 1000,
  });
}

export function useTimeLabels() {
  return useQuery({
    queryKey: LABELS_KEY,
    queryFn: () => timeEntriesApi.getLabels().then((r) => r.data.labels),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimeEntryDto) => timeEntriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODAY_TIME_KEY });
      qc.invalidateQueries({ queryKey: WEEKLY_TIME_KEY });
      qc.invalidateQueries({ queryKey: LABELS_KEY });
    },
    onError: () => toast.error("Error al guardar la sesión"),
  });
}

export function useUpdateTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryDto }) =>
      timeEntriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODAY_TIME_KEY });
      qc.invalidateQueries({ queryKey: WEEKLY_TIME_KEY });
      toast.success("Sesión actualizada");
    },
    onError: () => toast.error("Error al actualizar la sesión"),
  });
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeEntriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODAY_TIME_KEY });
      qc.invalidateQueries({ queryKey: WEEKLY_TIME_KEY });
      toast.success("Sesión eliminada");
    },
    onError: () => toast.error("Error al eliminar la sesión"),
  });
}
