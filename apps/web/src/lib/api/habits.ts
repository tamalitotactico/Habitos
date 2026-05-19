import { api } from "./client";

export interface HabitLog {
  id: string;
  completed: boolean;
  duration: number | null;
  note: string | null;
}

export interface Habit {
  id: string;
  name: string;
  type: "good" | "bad";
  frequency: number;
  targetDuration: number | null;
  trigger: string | null;
  isArchived: boolean;
  streak: number;
  createdAt: string;
}

export interface HabitWithToday extends Habit {
  adherence?: number;
  todayLog: HabitLog | null;
}

export interface CreateHabitDto {
  name: string;
  type: "good" | "bad";
  frequency: number;
  targetDuration?: number;
  trigger?: string;
}

export interface UpdateHabitDto {
  name?: string;
  frequency?: number;
  targetDuration?: number | null;
  trigger?: string | null;
  isArchived?: boolean;
}

export interface UpsertLogDto {
  habitId: string;
  date: string;
  completed: boolean;
  duration?: number;
  note?: string;
}

export const habitsApi = {
  getToday: () => api.get<{ habits: HabitWithToday[] }>("/habits/today"),
  getAll: (includeArchived = false) =>
    api.get<{ habits: (Habit & { adherence: number })[] }>("/habits", {
      params: { archived: includeArchived },
    }),
  create: (data: CreateHabitDto) =>
    api.post<{ habit: Habit }>("/habits", data),
  update: (id: string, data: UpdateHabitDto) =>
    api.patch<{ habit: Habit }>(`/habits/${id}`, data),
  archive: (id: string) => api.delete(`/habits/${id}`),
  upsertLog: (data: UpsertLogDto) =>
    api.post<{ log: HabitLog }>("/habit-logs", data),
  getHistory: (habitId: string, from: string, to: string) =>
    api.get<{ logs: (HabitLog & { date: string })[] }>(
      `/habit-logs/${habitId}/history`,
      { params: { from, to } }
    ),
};
