import { api } from "./client";

export const TIME_CATEGORIES = [
  "social",
  "work",
  "entertainment",
  "productivity",
  "other",
] as const;

export type TimeCategory = typeof TIME_CATEGORIES[number];
export type TimeSource = "manual" | "timer" | "extension";

export interface TimeEntry {
  id: string;
  label: string;
  category: TimeCategory;
  durationSec: number;
  startedAt: string;
  endedAt: string;
  source: TimeSource;
}

export interface CategorySummary {
  category: TimeCategory;
  totalSec: number;
}

export interface TodayResponse {
  entries: TimeEntry[];
  byCategory: CategorySummary[];
  totalSec: number;
}

export interface LabelSuggestion {
  label: string;
  category: TimeCategory;
}

export interface CreateTimeEntryDto {
  label: string;
  category: TimeCategory;
  durationSec: number;
  startedAt: string;
  endedAt: string;
  source: TimeSource;
}

export interface UpdateTimeEntryDto {
  label?: string;
  category?: TimeCategory;
}

export interface WeeklyDay {
  date: string;
  label: string;
  social: number;
  work: number;
  entertainment: number;
  productivity: number;
  other: number;
  total: number;
}

export interface WeeklyResponse {
  days: WeeklyDay[];
}

export const CATEGORY_LABELS: Record<TimeCategory, string> = {
  social: "Social",
  work: "Trabajo",
  entertainment: "Entretenimiento",
  productivity: "Productividad",
  other: "Otro",
};

export const CATEGORY_COLORS: Record<TimeCategory, string> = {
  social: "hsl(200, 70%, 50%)",
  work: "hsl(150, 60%, 45%)",
  entertainment: "hsl(280, 60%, 55%)",
  productivity: "hsl(45, 80%, 50%)",
  other: "hsl(0, 0%, 60%)",
};

export const CATEGORY_LIMITS_SEC: Partial<Record<TimeCategory, number>> = {
  social: 2 * 3600,
  entertainment: 3 * 3600,
  work: 8 * 3600,
};

export const timeEntriesApi = {
  getToday: () => api.get<TodayResponse>("/time-entries/today"),
  getWeekly: () => api.get<WeeklyResponse>("/time-entries/weekly"),
  getRange: (from: string, to: string) =>
    api.get<{ entries: TimeEntry[] }>("/time-entries", { params: { from, to } }),
  getLabels: () => api.get<{ labels: LabelSuggestion[] }>("/time-entries/labels"),
  create: (data: CreateTimeEntryDto) =>
    api.post<{ entry: TimeEntry }>("/time-entries", data),
  update: (id: string, data: UpdateTimeEntryDto) =>
    api.patch(`/time-entries/${id}`, data),
  delete: (id: string) => api.delete(`/time-entries/${id}`),
};
