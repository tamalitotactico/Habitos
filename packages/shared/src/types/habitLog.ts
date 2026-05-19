export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  duration: number | null;
  note: string | null;
  createdAt: string;
}

export interface UpsertHabitLogDto {
  habitId: string;
  date: string;
  completed: boolean;
  duration?: number;
  note?: string;
}
