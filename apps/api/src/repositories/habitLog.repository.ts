import { db } from "../lib/db";

export interface UpsertLogData {
  habitId: string;
  date: Date;
  completed: boolean;
  duration?: number;
  note?: string;
}

export const habitLogRepository = {
  // Get all logs for a habit between two dates (inclusive)
  findByHabitAndRange(habitId: string, from: Date, to: Date) {
    return db.habitLog.findMany({
      where: { habitId, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
  },

  // Get logs for multiple habits on a specific date (for dashboard)
  findByHabitsAndDate(habitIds: string[], date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return db.habitLog.findMany({
      where: { habitId: { in: habitIds }, date: { gte: start, lte: end } },
    });
  },

  upsert(data: UpsertLogData) {
    const start = new Date(data.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data.date);
    end.setHours(23, 59, 59, 999);
    return db.habitLog.upsert({
      where: { habitId_date: { habitId: data.habitId, date: data.date } },
      create: { ...data },
      update: {
        completed: data.completed,
        duration: data.duration,
        note: data.note,
      },
    });
  },

  // Returns all logs for a habit, ordered by date desc (for streak calculation)
  findRecentByHabit(habitId: string, limit: number) {
    return db.habitLog.findMany({
      where: { habitId },
      orderBy: { date: "desc" },
      take: limit,
    });
  },
};
