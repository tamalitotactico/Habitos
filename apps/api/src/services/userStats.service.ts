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
    };
  },

  /**
   * Award XP and update lifetime + daily streak counters atomically.
   * Returns the delta in XP and whether the user leveled up.
   */
  async awardForHabitLog(
    userId: string,
    opts: { habitType: "good" | "bad"; completed: boolean; logDate: Date }
  ) {
    const baseStats = await userStatsRepository.ensureExists(userId);
    const xpDelta =
      opts.completed
        ? (opts.habitType === "good" ? XP_REWARDS.goodHabitComplete : XP_REWARDS.badHabitAvoided)
        : 0;

    // Recompute daily streak: completed activity today counts as "active"
    const today = new Date(opts.logDate);
    today.setHours(0, 0, 0, 0);
    const prevLast = baseStats.lastActiveDate
      ? new Date(baseStats.lastActiveDate.toISOString().slice(0, 10) + "T00:00:00")
      : null;

    let newStreak = baseStats.currentDailyStreak;
    let bonusXp = 0;
    if (opts.completed) {
      if (!prevLast || toDateKey(prevLast) !== toDateKey(today)) {
        // First activity of `today`
        if (prevLast && daysBetween(prevLast, today) === 1) {
          newStreak += 1;
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
    });

    return {
      xpDelta: xpDelta + bonusXp,
      leveledUp,
      newLevel,
      newStreak,
    };
  },

  /**
   * Compute a server-side StatsSnapshot for achievement evaluation.
   * Includes perfectDays and badHabitAvoidanceDays which require DB queries.
   */
  async snapshot(userId: string) {
    const stats = await userStatsRepository.ensureExists(userId);

    // All active habits
    const habits = await db.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true, type: true },
    });
    const habitIds = habits.map((h) => h.id);
    const badHabitIds = habits.filter((h) => h.type === "bad").map((h) => h.id);

    // Bad-habit avoidance days = count of distinct dates where any bad habit was completed
    let badAvoidance = 0;
    if (badHabitIds.length > 0) {
      const logs = await db.habitLog.findMany({
        where: { habitId: { in: badHabitIds }, completed: true },
        select: { date: true },
      });
      const days = new Set(logs.map((l) => toDateKey(l.date)));
      badAvoidance = days.size;
    }

    // Perfect days: days where every active habit was completed
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
};
