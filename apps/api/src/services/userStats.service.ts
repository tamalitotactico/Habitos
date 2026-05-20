import { db } from "../lib/db";
import { userStatsRepository } from "../repositories/userStats.repository";
import { levelFromXp, xpProgress, XP_REWARDS } from "../domain/achievement.catalog";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

const FREEZE_REFRESH_DAYS = 7;
const MAX_FREEZES = 2;

export const userStatsService = {
  async get(userId: string) {
    const stats = await userStatsRepository.ensureExists(userId);
    const progress = xpProgress(stats.xp);
    return {
      xp: stats.xp,
      level: progress.level,
      xpInLevel: progress.xpInLevel,
      xpForNextLevel: progress.xpForNextLevel,
      percentToNextLevel: progress.percent,
      lifetimeCompletions: stats.lifetimeCompletions,
      currentDailyStreak: stats.currentDailyStreak,
      longestDailyStreak: stats.longestDailyStreak,
      lastActiveDate: stats.lastActiveDate?.toISOString() ?? null,
      streakFreezesAvailable: stats.streakFreezesAvailable,
    };
  },

  /**
   * Award XP and update lifetime + daily streak counters atomically.
   * Includes streak freeze logic: if there's a 2-day gap and the user has a freeze,
   * the streak continues (freeze is consumed).
   */
  async awardForHabitLog(
    userId: string,
    opts: { habitType: "good" | "bad"; completed: boolean; logDate: Date }
  ) {
    const baseStats = await userStatsRepository.ensureExists(userId);

    // Refresh freezes: gain +1 freeze if FREEZE_REFRESH_DAYS passed since last refresh
    const now = new Date();
    let freezes = baseStats.streakFreezesAvailable;
    let freezeRefresh = baseStats.lastFreezeRefreshAt;
    if (!freezeRefresh || daysBetween(freezeRefresh, now) >= FREEZE_REFRESH_DAYS) {
      freezes = Math.min(MAX_FREEZES, freezes + 1);
      freezeRefresh = now;
    }

    const xpDelta = opts.completed
      ? (opts.habitType === "good" ? XP_REWARDS.goodHabitComplete : XP_REWARDS.badHabitAvoided)
      : 0;

    const today = new Date(opts.logDate);
    today.setHours(0, 0, 0, 0);
    const prevLast = baseStats.lastActiveDate
      ? new Date(baseStats.lastActiveDate.toISOString().slice(0, 10) + "T00:00:00")
      : null;

    let newStreak = baseStats.currentDailyStreak;
    let bonusXp = 0;
    let freezeUsed = false;

    if (opts.completed) {
      if (!prevLast || toDateKey(prevLast) !== toDateKey(today)) {
        const gap = prevLast ? daysBetween(prevLast, today) : 0;
        if (!prevLast) {
          newStreak = 1;
        } else if (gap === 1) {
          newStreak += 1;
        } else if (gap === 2 && freezes > 0) {
          // Consume freeze, keep streak going
          newStreak += 1;
          freezes -= 1;
          freezeUsed = true;
        } else {
          newStreak = 1;
        }
        bonusXp = XP_REWARDS.dailyStreakBonus;
      }
    }

    const totalXp = baseStats.xp + xpDelta + bonusXp;
    const newLevel = levelFromXp(totalXp);
    const leveledUp = newLevel > baseStats.level;

    const lifetimeDelta = opts.completed ? 1 : -1;
    const newLifetime = Math.max(0, baseStats.lifetimeCompletions + lifetimeDelta);
    const longest = Math.max(baseStats.longestDailyStreak, newStreak);

    await userStatsRepository.upsert(userId, {
      xp: totalXp,
      level: newLevel,
      lifetimeCompletions: newLifetime,
      currentDailyStreak: newStreak,
      longestDailyStreak: longest,
      lastActiveDate: opts.completed ? today : baseStats.lastActiveDate,
      streakFreezesAvailable: freezes,
      lastFreezeRefreshAt: freezeRefresh,
    });

    return {
      xpDelta: xpDelta + bonusXp,
      leveledUp,
      newLevel,
      newStreak,
      freezeUsed,
    };
  },

  async snapshot(userId: string) {
    const stats = await userStatsRepository.ensureExists(userId);

    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true, type: true },
    });
    const habitIds = habits.map((h) => h.id);
    const badHabitIds = habits.filter((h) => h.type === "bad").map((h) => h.id);

    let badAvoidance = 0;
    if (badHabitIds.length > 0) {
      const logs = await db.habitLog.findMany({
        where: { habitId: { in: badHabitIds }, completed: true },
        select: { date: true },
      });
      const days = new Set(logs.map((l) => toDateKey(l.date)));
      badAvoidance = days.size;
    }

    let perfectDays = 0;
    if (habitIds.length > 0) {
      const logs = await db.habitLog.findMany({
        where: { habitId: { in: habitIds }, completed: true },
        select: { date: true, habitId: true },
      });
      const byDate = new Map<string, Set<string>>();
      for (const l of logs) {
        const key = toDateKey(l.date);
        if (!byDate.has(key)) byDate.set(key, new Set());
        byDate.get(key)!.add(l.habitId);
      }
      for (const set of byDate.values()) {
        if (set.size === habitIds.length) perfectDays += 1;
      }
    }

    return {
      lifetimeCompletions: stats.lifetimeCompletions,
      currentDailyStreak: stats.currentDailyStreak,
      longestDailyStreak: stats.longestDailyStreak,
      totalHabits: habits.length,
      badHabitAvoidanceDays: badAvoidance,
      perfectDays,
    };
  },

  /**
   * Returns the last 90 days as a heatmap: completion ratio per day.
   * Each day has { date, completed, total, ratio }.
   */
  async getCalendar(userId: string, days = 90) {
    const now = new Date();
    const startDate = subDays(now, days - 1);
    startDate.setHours(0, 0, 0, 0);

    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true },
    });
    const habitIds = habits.map((h) => h.id);
    const totalHabits = habits.length;

    if (habitIds.length === 0) {
      // Still return the structure
      return Array.from({ length: days }, (_, i) => {
        const d = subDays(now, days - 1 - i);
        return { date: toDateKey(d), completed: 0, total: 0, ratio: 0 };
      });
    }

    const logs = await db.habitLog.findMany({
      where: { habitId: { in: habitIds }, date: { gte: startDate }, completed: true },
      select: { date: true, habitId: true },
    });

    // Count distinct habit completions per day
    const byDate = new Map<string, Set<string>>();
    for (const l of logs) {
      const k = toDateKey(l.date);
      if (!byDate.has(k)) byDate.set(k, new Set());
      byDate.get(k)!.add(l.habitId);
    }

    return Array.from({ length: days }, (_, i) => {
      const d = subDays(now, days - 1 - i);
      const key = toDateKey(d);
      const completed = byDate.get(key)?.size ?? 0;
      const ratio = totalHabits > 0 ? completed / totalHabits : 0;
      return { date: key, completed, total: totalHabits, ratio };
    });
  },
};
