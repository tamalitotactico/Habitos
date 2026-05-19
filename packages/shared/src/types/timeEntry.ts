export type TimeCategory =
  | "social"
  | "work"
  | "entertainment"
  | "productivity"
  | "other";

export type TimeSource = "manual" | "timer" | "extension";

export interface TimeEntry {
  id: string;
  userId: string;
  label: string;
  category: TimeCategory;
  durationSec: number;
  startedAt: string;
  endedAt: string;
  source: TimeSource;
}

export interface CreateTimeEntryDto {
  label: string;
  category: TimeCategory;
  durationSec: number;
  startedAt: string;
  endedAt: string;
  source: TimeSource;
}

export interface TimeEntrySummary {
  category: TimeCategory;
  totalSec: number;
}
