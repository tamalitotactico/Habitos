import { AppError } from "../middleware/error.middleware";
import { habitRepository } from "../repositories/habit.repository";
import { habitLogRepository } from "../repositories/habitLog.repository";
import { userStatsService } from "./userStats.service";
import { achievementService } from "./achievement.service";

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

    // Detect if the log was previously completed to know whether this is a state change
    const existing = await habitLogRepository.findRecentByHabit(habitId, 60);
    const prior = existing.find(
      (l) => l.date.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
    );
    const wasCompleted = prior?.completed ?? false;

    const log = await habitLogRepository.upsert({
      habitId,
      date,
      completed: data.completed,
      duration: data.duration,
      note: data.note,
    });

    // Award XP and update stats ONLY on state change (avoid double-rewarding)
    let stats = null;
    let newAchievements: Array<unknown> = [];
    if (data.completed !== wasCompleted) {
      stats = await userStatsService.awardForHabitLog(userId, {
        habitType: habit.type as "good" | "bad",
        completed: data.completed,
        logDate: date,
      });
      // Only check achievements when completing (not when uncompleting)
      if (data.completed) {
        newAchievements = await achievementService.checkAndUnlock(userId);
      }
    }

    return { log, stats, newAchievements };
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
