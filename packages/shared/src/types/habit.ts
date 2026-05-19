export type HabitType = "good" | "bad";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  frequency: number;
  targetDuration: number | null;
  trigger: string | null;
  replacementFor: string | null;
  isArchived: boolean;
  createdAt: string;
}

export interface CreateHabitDto {
  name: string;
  type: HabitType;
  frequency: number;
  targetDuration?: number;
  trigger?: string;
  replacementFor?: string;
}

export interface UpdateHabitDto {
  name?: string;
  frequency?: number;
  targetDuration?: number;
  trigger?: string;
  isArchived?: boolean;
}
