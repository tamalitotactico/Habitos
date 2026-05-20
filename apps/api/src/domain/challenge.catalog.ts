/**
 * Challenge templates assigned daily/weekly via rotation.
 * Progress is computed dynamically from user state — no per-challenge counters stored.
 */

export type ChallengeType = "daily" | "weekly";

export type ChallengeMetric =
  | "habits_today_completed"
  | "habits_week_completed"
  | "perfect_days_week"
  | "bad_avoided_today"
  | "bad_avoided_week"
  | "any_habit_today"
  | "good_habits_today";

export interface ChallengeDef {
  key: string;
  title: string;
  description: string;
  type: ChallengeType;
  metric: ChallengeMetric;
  goal: number;
  xpReward: number;
  icon: string;
}

export const CHALLENGE_CATALOG: ChallengeDef[] = [
  // — Daily —
  { key: "d_start",       title: "Buen comienzo",   description: "Completa cualquier hábito hoy",      type: "daily", metric: "any_habit_today",        goal: 1, xpReward: 20, icon: "Sparkles" },
  { key: "d_three",       title: "Trío del día",    description: "Completa 3 hábitos hoy",             type: "daily", metric: "habits_today_completed", goal: 3, xpReward: 40, icon: "CheckCheck" },
  { key: "d_two_good",    title: "Doble crecimiento", description: "Completa 2 hábitos buenos hoy",    type: "daily", metric: "good_habits_today",      goal: 2, xpReward: 35, icon: "Sprout" },
  { key: "d_avoid",       title: "Triunfo personal", description: "Supera 1 hábito negativo hoy",      type: "daily", metric: "bad_avoided_today",      goal: 1, xpReward: 40, icon: "Shield" },
  { key: "d_five",        title: "Día imparable",   description: "Completa 5 hábitos hoy",             type: "daily", metric: "habits_today_completed", goal: 5, xpReward: 60, icon: "Flame" },

  // — Weekly —
  { key: "w_fifteen",     title: "Semana sólida",    description: "Completa 15 hábitos esta semana",   type: "weekly", metric: "habits_week_completed", goal: 15, xpReward: 120, icon: "Trophy" },
  { key: "w_perfect_3",   title: "Trío perfecto",    description: "Logra 3 días perfectos esta semana", type: "weekly", metric: "perfect_days_week",    goal: 3, xpReward: 150, icon: "Medal" },
  { key: "w_avoid_4",     title: "Auto-control",     description: "Supera un hábito negativo 4 días",  type: "weekly", metric: "bad_avoided_week",      goal: 4, xpReward: 140, icon: "ShieldCheck" },
  { key: "w_twentyfive",  title: "Maratón",          description: "Completa 25 hábitos esta semana",   type: "weekly", metric: "habits_week_completed", goal: 25, xpReward: 200, icon: "Star" },
  { key: "w_perfect_5",   title: "Casi perfecta",    description: "Logra 5 días perfectos esta semana", type: "weekly", metric: "perfect_days_week",    goal: 5, xpReward: 250, icon: "Crown" },
];

export const CHALLENGE_BY_KEY = new Map(CHALLENGE_CATALOG.map((c) => [c.key, c]));

const DAILY_KEYS = CHALLENGE_CATALOG.filter((c) => c.type === "daily").map((c) => c.key);
const WEEKLY_KEYS = CHALLENGE_CATALOG.filter((c) => c.type === "weekly").map((c) => c.key);

// Deterministic, rotating selection per (userId + period).
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickDailyChallenge(userId: string, periodKey: string): ChallengeDef {
  const idx = hashString(`${userId}|${periodKey}`) % DAILY_KEYS.length;
  return CHALLENGE_BY_KEY.get(DAILY_KEYS[idx])!;
}

export function pickWeeklyChallenge(userId: string, periodKey: string): ChallengeDef {
  const idx = hashString(`${userId}|${periodKey}`) % WEEKLY_KEYS.length;
  return CHALLENGE_BY_KEY.get(WEEKLY_KEYS[idx])!;
}

// Period helpers
export function dailyPeriodKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weeklyPeriodKey(d: Date): string {
  // ISO week — close enough for our purposes
  const date = new Date(d);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export function endOfWeek(d: Date): Date {
  // End of week = Sunday 23:59:59 (Mon-Sun)
  const r = new Date(d);
  const day = r.getDay() || 7; // Sunday=7
  r.setDate(r.getDate() + (7 - day));
  r.setHours(23, 59, 59, 999);
  return r;
}
