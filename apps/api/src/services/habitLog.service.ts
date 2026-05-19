import { AppError } from "../middleware/error.middleware";
import { habitRepository } from "../repositories/habit.repository";
import { habitLogRepository } from "../repositories/habitLog.repository";

export const habitLogService = {
  async upsert(
    userId: string,
    habitId: string,
    data: { date: string; completed: boolean; duration?: number; note?: string }
  ) {
    const habit = await habitRepository.findById(habitId, userId);
    if (!habit) throw new AppError(404, "Habit not found");

    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    return habitLogRepository.upsert({
      habitId,
      date,
      completed: data.completed,
      duration: data.duration,
      note: data.note,
    });
  },

  async getHistory(userId: string, habitId: string, from: string, to: string) {
    const habit = await habitRepository.findById(habitId, userId);
    if (!habit) throw new AppError(404, "Habit not found");

    const logs = await habitLogRepository.findByHabitAndRange(
      habitId,
      new Date(from),
      new Date(to)
    );

    return logs.map((l) => ({
      ...l,
      date: l.date.toISOString().split("T")[0],
      createdAt: l.createdAt.toISOString(),
    }));
  },
};
