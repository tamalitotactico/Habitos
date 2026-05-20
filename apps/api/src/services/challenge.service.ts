import { db } from "../lib/db";
import { challengeRepository } from "../repositories/challenge.repository";
import { userStatsRepository } from "../repositories/userStats.repository";
import {
  ChallengeDef, ChallengeMetric,
  CHALLENGE_BY_KEY,
  pickDailyChallenge, pickWeeklyChallenge,
  dailyPeriodKey, weeklyPeriodKey, endOfDay, endOfWeek,
} from "../domain/challenge.catalog";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay() || 7;
  r.setDate(r.getDate() - (day - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}

interface MetricSnapshot {
  habits_today_completed: number;
  habits_week_completed: number;
  perfect_days_week: number;
  bad_avoided_today: number;
  bad_avoided_week: number;
  any_habit_today: number;
  good_habits_today: number;
}

async function computeMetricSnapshot(userId: string): Promise<MetricSnapshot> {
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(now); endToday.setHours(23, 59, 59, 999);
  const weekStart = startOfWeek(now);

  const habits = await db.habit.findMany({
    where: { userId, isArchived: false },
    select: { id: true, type: true },
  });
  const habitIds = habits.map((h) => h.id);
  const goodIds = new Set(habits.filter((h) => h.type === "good").map((h) => h.id));
  const badIds = new Set(habits.filter((h) => h.type === "bad").map((h) => h.id));

  if (habitIds.length === 0) {
    return {
      habits_today_completed: 0, habits_week_completed: 0, perfect_days_week: 0,
      bad_avoided_today: 0, bad_avoided_week: 0, any_habit_today: 0, good_habits_today: 0,
    };
  }

  // Today's completed logs
  const todayLogs = await db.habitLog.findMany({
    where: { habitId: { in: habitIds }, date: { gte: startToday, lte: endToday }, completed: true },
    select: { habitId: true },
  });
  const todayCount = todayLogs.length;
  const goodToday = todayLogs.filter((l) => goodIds.has(l.habitId)).length;
  const badToday = todayLogs.filter((l) => badIds.has(l.habitId)).length;
  const anyToday = todayCount > 0 ? 1 : 0;

  // This week's completed logs
  const weekLogs = await db.habitLog.findMany({
    where: { habitId: { in: habitIds }, date: { gte: weekStart, lte: endToday }, completed: true },
    select: { habitId: true, date: true },
  });
  const weekCount = weekLogs.length;
  const badWeekDays = new Set(
    weekLogs.filter((l) => badIds.has(l.habitId)).map((l) => toDateKey(l.date))
  ).size;

  // Perfect days this week
  const byDate = new Map<string, Set<string>>();
  for (const l of weekLogs) {
    const k = toDateKey(l.date);
    if (!byDate.has(k)) byDate.set(k, new Set());
    byDate.get(k)!.add(l.habitId);
  }
  let perfectWeek = 0;
  for (const set of byDate.values()) {
    if (set.size === habitIds.length) perfectWeek += 1;
  }

  return {
    habits_today_completed: todayCount,
    habits_week_completed: weekCount,
    perfect_days_week: perfectWeek,
    bad_avoided_today: badToday,
    bad_avoided_week: badWeekDays,
    any_habit_today: anyToday,
    good_habits_today: goodToday,
  };
}

interface ActiveChallenge {
  id: string;
  challenge: ChallengeDef;
  type: "daily" | "weekly";
  progress: number;
  goal: number;
  percent: number;
  completed: boolean;
  completedAt: string | null;
  expiresAt: string;
}

export const challengeService = {
  /**
   * Returns active challenges (assigning new ones if needed).
   * Always returns exactly one daily and one weekly.
   */
  async getActive(userId: string): Promise<ActiveChallenge[]> {
    const now = new Date();
    const dailyKey = dailyPeriodKey(now);
    const weeklyKey = weeklyPeriodKey(now);

    // Ensure a daily assignment exists
    let daily = await challengeRepository.findByPeriod(userId, "daily", dailyKey);
    if (!daily) {
      const def = pickDailyChallenge(userId, dailyKey);
      daily = await challengeRepository.create({
        userId, challengeKey: def.key, type: "daily",
        periodKey: dailyKey, expiresAt: endOfDay(now),
      });
    }

    let weekly = await challengeRepository.findByPeriod(userId, "weekly", weeklyKey);
    if (!weekly) {
      const def = pickWeeklyChallenge(userId, weeklyKey);
      weekly = await challengeRepository.create({
        userId, challengeKey: def.key, type: "weekly",
        periodKey: weeklyKey, expiresAt: endOfWeek(now),
      });
    }

    const snap = await computeMetricSnapshot(userId);

    function buildView(a: typeof daily, type: "daily" | "weekly"): ActiveChallenge | null {
      if (!a) return null;
      const def = CHALLENGE_BY_KEY.get(a.challengeKey);
      if (!def) return null;
      const progress = Math.min(def.goal, snap[def.metric as ChallengeMetric]);
      const percent = Math.min(100, Math.round((progress / def.goal) * 100));
      return {
        id: a.id, challenge: def, type,
        progress, goal: def.goal, percent,
        completed: !!a.completedAt,
        completedAt: a.completedAt?.toISOString() ?? null,
        expiresAt: a.expiresAt.toISOString(),
      };
    }

    return [buildView(daily, "daily"), buildView(weekly, "weekly")].filter(
      (x): x is ActiveChallenge => x !== null
    );
  },

  /**
   * Called after a habit log change. Marks any newly-completed challenges and awards XP.
   * Returns the keys of challenges completed.
   */
  async checkProgress(userId: string): Promise<string[]> {
    const active = await this.getActive(userId);
    const newlyCompleted: string[] = [];

    for (const c of active) {
      if (c.completed) continue;
      if (c.progress >= c.goal) {
        await challengeRepository.markComplete(c.id);
        newlyCompleted.push(c.challenge.key);

        // Award XP
        const stats = await userStatsRepository.ensureExists(userId);
        await userStatsRepository.upsert(userId, { xp: stats.xp + c.challenge.xpReward });
      }
    }

    return newlyCompleted;
  },
};
