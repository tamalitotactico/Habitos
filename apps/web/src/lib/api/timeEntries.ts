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

export const timeEntriesApi = {
  getToday: () => api.get<TodayResponse>("/time-entries/today"),
  getRange: (from: string, to: string) =>
    api.get<{ entries: TimeEntry[] }>("/time-entries", { params: { from, to } }),
  getLabels: () => api.get<{ labels: LabelSuggestion[] }>("/time-entries/labels"),
  create: (data: CreateTimeEntryDto) =>
    api.post<{ entry: TimeEntry }>("/time-entries", data),
  delete: (id: string) => api.delete(`/time-entries/${id}`),
};
