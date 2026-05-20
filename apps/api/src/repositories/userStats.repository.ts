import { db } from "../lib/db";

export const userStatsRepository = {
  findByUserId(userId: string) {
    return db.userStats.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: {
    xp?: number;
    level?: number;
    lifetimeCompletions?: number;
    currentDailyStreak?: number;
    longestDailyStreak?: number;
    lastActiveDate?: Date | null;
    streakFreezesAvailable?: number;
    lastFreezeRefreshAt?: Date | null;
  }) {
    return db.userStats.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },

  ensureExists(userId: string) {
    return db.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  },
};
