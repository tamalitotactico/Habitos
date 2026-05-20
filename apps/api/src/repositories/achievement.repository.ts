import { db } from "../lib/db";

export const achievementRepository = {
  findByUserId(userId: string) {
    return db.achievementUnlock.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });
  },

  findUnnotified(userId: string) {
    return db.achievementUnlock.findMany({
      where: { userId, notifiedAt: null },
      orderBy: { unlockedAt: "asc" },
    });
  },

  createMany(entries: Array<{ userId: string; achievementKey: string }>) {
    if (entries.length === 0) return Promise.resolve({ count: 0 });
    return db.achievementUnlock.createMany({
      data: entries,
    });
  },

  markNotified(ids: string[]) {
    if (ids.length === 0) return Promise.resolve({ count: 0 });
    return db.achievementUnlock.updateMany({
      where: { id: { in: ids } },
      data: { notifiedAt: new Date() },
    });
  },

  countCompletedHabitLogsToday(habitIds: string[], date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return db.habitLog.count({
      where: {
        habitId: { in: habitIds },
        date: { gte: start, lte: end },
        completed: true,
      },
    });
  },
};
