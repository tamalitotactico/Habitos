import { db } from "../lib/db";
import { insightRepository } from "../repositories/insight.repository";
import { AppError } from "../middleware/error.middleware";

const LIMITS_SEC: Record<string, number> = {
  social: 2 * 3600,
  entertainment: 3 * 3600,
  work: 8 * 3600,
};

const CATEGORY_LABELS: Record<string, string> = {
  social: "Social",
  work: "Trabajo",
  entertainment: "Entretenimiento",
};

const DAY_NAMES = [
  "domingos", "lunes", "martes", "miércoles",
  "jueves", "viernes", "sábados",
];

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

type Entry = { startedAt: Date; category: string; durationSec: number };
type Log = { date: Date; completed: boolean };
type InsightInput = { type: string; content: string; data: string };

function checkLimitOverruns(entries: Entry[]): InsightInput[] {
  const byDayCat: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    const day = toDateKey(e.startedAt);
    if (!byDayCat[day]) byDayCat[day] = {};
    byDayCat[day][e.category] = (byDayCat[day][e.category] ?? 0) + e.durationSec;
  }

  const results: InsightInput[] = [];
  for (const [cat, limit] of Object.entries(LIMITS_SEC)) {
    const overDays = Object.values(byDayCat).filter((d) => (d[cat] ?? 0) > limit).length;
    if (overDays >= 3) {
      results.push({
        type: "alert",
        content: `Has superado tu límite de ${CATEGORY_LABELS[cat] ?? cat} ${overDays} días en las últimas 4 semanas.`,
        data: JSON.stringify({ category: cat, overDays }),
      });
    }
  }
  return results;
}

function checkHabitGap(logs: Log[]): InsightInput[] {
  const completedDays = new Set(
    logs.filter((l) => l.completed).map((l) => toDateKey(l.date))
  );

  let gap = 0;
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    if (!completedDays.has(toDateKey(subDays(today, i)))) {
      gap++;
    } else {
      break;
    }
  }

  if (gap >= 2) {
    return [{
      type: "alert",
      content: `Llevas ${gap} días consecutivos sin completar ningún hábito. ¡Es momento de retomar!`,
      data: JSON.stringify({ gapDays: gap }),
    }];
  }
  return [];
}

function checkWorkVsHabits(entries: Entry[], logs: Log[]): InsightInput[] {
  const workByDay: Record<string, number> = {};
  for (const e of entries) {
    if (e.category !== "work") continue;
    const day = toDateKey(e.startedAt);
    workByDay[day] = (workByDay[day] ?? 0) + e.durationSec;
  }

  const logsByDay: Record<string, { completed: number; total: number }> = {};
  for (const l of logs) {
    const day = toDateKey(l.date);
    if (!logsByDay[day]) logsByDay[day] = { completed: 0, total: 0 };
    logsByDay[day].total++;
    if (l.completed) logsByDay[day].completed++;
  }

  const highWorkRates: number[] = [];
  const normalRates: number[] = [];

  for (const [day, counts] of Object.entries(logsByDay)) {
    if (counts.total === 0) continue;
    const rate = counts.completed / counts.total;
    const workSec = workByDay[day] ?? 0;
    if (workSec > 6 * 3600) {
      highWorkRates.push(rate);
    } else if (workSec > 0) {
      normalRates.push(rate);
    }
  }

  if (highWorkRates.length < 3 || normalRates.length < 3) return [];

  const avgHigh = highWorkRates.reduce((a, b) => a + b, 0) / highWorkRates.length;
  const avgNormal = normalRates.reduce((a, b) => a + b, 0) / normalRates.length;

  if (avgNormal - avgHigh > 0.2) {
    return [{
      type: "correlation",
      content: `Los días que trabajas más de 6h completas el ${Math.round(avgHigh * 100)}% de tus hábitos, frente al ${Math.round(avgNormal * 100)}% en días normales.`,
      data: JSON.stringify({ avgHighWork: avgHigh, avgNormal }),
    }];
  }
  return [];
}

function checkProblemDays(entries: Entry[]): InsightInput[] {
  const results: InsightInput[] = [];

  for (const [cat, limit] of Object.entries(LIMITS_SEC)) {
    if (cat === "work") continue;

    const byDay: Record<string, number> = {};
    for (const e of entries) {
      if (e.category !== cat) continue;
      const day = toDateKey(e.startedAt);
      byDay[day] = (byDay[day] ?? 0) + e.durationSec;
    }

    if (Object.keys(byDay).length < 7) continue;

    const byDow: Record<number, number[]> = {};
    for (const [day, sec] of Object.entries(byDay)) {
      // Use noon UTC to avoid timezone-related off-by-one on day boundaries
      const dow = new Date(`${day}T12:00:00Z`).getDay();
      if (!byDow[dow]) byDow[dow] = [];
      byDow[dow].push(sec);
    }

    let maxAvg = 0;
    let maxDow = -1;
    for (const [dow, secs] of Object.entries(byDow)) {
      if (secs.length < 2) continue;
      const avg = secs.reduce((a, b) => a + b, 0) / secs.length;
      if (avg > maxAvg) { maxAvg = avg; maxDow = Number(dow); }
    }

    if (maxDow >= 0 && maxAvg > limit) {
      const hours = Math.round((maxAvg / 3600) * 10) / 10;
      results.push({
        type: "prediction",
        content: `Los ${DAY_NAMES[maxDow]} tiendes a superar tu límite de ${CATEGORY_LABELS[cat] ?? cat} (media de ${hours}h).`,
        data: JSON.stringify({ category: cat, dayOfWeek: maxDow, avgSec: maxAvg }),
      });
    }
  }
  return results;
}

function checkBestHabitDay(logs: Log[]): InsightInput[] {
  const byDow: Record<number, { completed: number; total: number }> = {};
  for (const l of logs) {
    const dow = l.date.getDay();
    if (!byDow[dow]) byDow[dow] = { completed: 0, total: 0 };
    byDow[dow].total++;
    if (l.completed) byDow[dow].completed++;
  }

  let maxRate = 0;
  let maxDow = -1;
  for (const [dow, { completed, total }] of Object.entries(byDow)) {
    if (total < 3) continue;
    const rate = completed / total;
    if (rate > maxRate) { maxRate = rate; maxDow = Number(dow); }
  }

  if (maxDow >= 0 && maxRate >= 0.6) {
    return [{
      type: "suggestion",
      content: `Los ${DAY_NAMES[maxDow]} son tu mejor día para completar hábitos (${Math.round(maxRate * 100)}% de cumplimiento). Programa los más importantes ese día.`,
      data: JSON.stringify({ dayOfWeek: maxDow, completionRate: maxRate }),
    }];
  }
  return [];
}

export const insightService = {
  async getActive(userId: string) {
    return insightRepository.findActive(userId);
  },

  async generate(userId: string) {
    const now = new Date();
    const from = subDays(now, 30);

    const [habits, entries] = await Promise.all([
      db.habit.findMany({ where: { userId, isArchived: false } }),
      db.timeEntry.findMany({ where: { userId, startedAt: { gte: from } } }),
    ]);

    const logs =
      habits.length > 0
        ? await db.habitLog.findMany({
            where: { habitId: { in: habits.map((h) => h.id) }, date: { gte: from } },
          })
        : [];

    const newInsights: InsightInput[] = [
      ...checkLimitOverruns(entries),
      ...checkHabitGap(logs),
      ...checkWorkVsHabits(entries, logs),
      ...checkProblemDays(entries),
      ...checkBestHabitDay(logs),
    ];

    await insightRepository.deleteByUser(userId);
    if (newInsights.length > 0) {
      await insightRepository.createMany(newInsights.map((i) => ({ ...i, userId })));
    }

    return insightRepository.findActive(userId);
  },

  async dismiss(id: string, userId: string) {
    const result = await insightRepository.dismiss(id, userId);
    if (result.count === 0) throw new AppError(404, "Insight not found");
  },
};
