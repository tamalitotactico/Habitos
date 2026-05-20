/**
 * Single source of truth for achievements.
 * Server uses this to evaluate unlocks; frontend mirrors the metadata.
 *
 * Categories: completion | streak | consistency | balance
 * Rarities:   common | rare | epic | legendary
 */

export type AchievementCategory = "completion" | "streak" | "consistency" | "balance";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;        // lucide icon name
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  // Function evaluated server-side. Returns true if user has earned it.
  threshold: number;
}

export interface StatsSnapshot {
  lifetimeCompletions: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  totalHabits: number;
  badHabitAvoidanceDays: number; // days where any "bad" habit log was completed=true (treated as "I avoided it")
  perfectDays: number;           // days where ALL active habits were completed
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // — Completion —
  { key: "first_step",      title: "Primer paso",         description: "Completa tu primer hábito",         icon: "Sprout",   category: "completion",  rarity: "common",    xpReward: 25,  threshold: 1 },
  { key: "ten_done",        title: "Decena",              description: "Completa 10 hábitos en total",      icon: "CheckCheck",category: "completion",  rarity: "common",    xpReward: 50,  threshold: 10 },
  { key: "fifty_done",      title: "Cincuentena",         description: "Completa 50 hábitos en total",      icon: "Award",    category: "completion",  rarity: "rare",      xpReward: 100, threshold: 50 },
  { key: "century_done",    title: "Centena",             description: "Completa 100 hábitos en total",     icon: "Trophy",   category: "completion",  rarity: "epic",      xpReward: 250, threshold: 100 },
  { key: "five_hundred",    title: "Maestría",            description: "Completa 500 hábitos en total",     icon: "Crown",    category: "completion",  rarity: "legendary", xpReward: 500, threshold: 500 },

  // — Streaks —
  { key: "streak_3",        title: "Tres días",           description: "Mantén una racha diaria de 3 días", icon: "Flame",    category: "streak",      rarity: "common",    xpReward: 30,  threshold: 3 },
  { key: "streak_7",        title: "Una semana",          description: "Mantén una racha diaria de 7 días", icon: "Flame",    category: "streak",      rarity: "rare",      xpReward: 75,  threshold: 7 },
  { key: "streak_14",       title: "Quincena",            description: "14 días seguidos",                  icon: "Flame",    category: "streak",      rarity: "rare",      xpReward: 150, threshold: 14 },
  { key: "streak_30",       title: "Un mes",              description: "30 días de racha continua",         icon: "Sparkles", category: "streak",      rarity: "epic",      xpReward: 300, threshold: 30 },
  { key: "streak_100",      title: "Centenario",          description: "100 días seguidos",                 icon: "Star",     category: "streak",      rarity: "legendary", xpReward: 1000,threshold: 100 },

  // — Consistency —
  { key: "perfect_day",     title: "Día perfecto",        description: "Completa todos tus hábitos en un día", icon: "Sun",   category: "consistency", rarity: "rare",      xpReward: 75,  threshold: 1 },
  { key: "perfect_week",    title: "Semana impecable",    description: "7 días perfectos seguidos",         icon: "Medal",    category: "consistency", rarity: "epic",      xpReward: 250, threshold: 7 },

  // — Balance (bad habits / avoidance) —
  { key: "avoid_3",         title: "Triunfo del autocontrol", description: "Evita un hábito negativo 3 días", icon: "Shield",  category: "balance",     rarity: "rare",      xpReward: 100, threshold: 3 },
  { key: "avoid_7",         title: "Una semana libre",    description: "Evita un hábito negativo 7 días",   icon: "ShieldCheck",category: "balance",   rarity: "epic",      xpReward: 200, threshold: 7 },
];

export const ACHIEVEMENT_BY_KEY = new Map(ACHIEVEMENTS.map((a) => [a.key, a]));

/**
 * Given a stats snapshot, returns the set of achievement keys the user has earned.
 * Pure function — easy to test and reason about.
 */
export function evaluateUnlocks(stats: StatsSnapshot): Set<string> {
  const unlocked = new Set<string>();
  const has = (key: string) => unlocked.add(key);

  // Completion thresholds
  if (stats.lifetimeCompletions >= 1)   has("first_step");
  if (stats.lifetimeCompletions >= 10)  has("ten_done");
  if (stats.lifetimeCompletions >= 50)  has("fifty_done");
  if (stats.lifetimeCompletions >= 100) has("century_done");
  if (stats.lifetimeCompletions >= 500) has("five_hundred");

  // Streak thresholds (use longest, not just current, so once earned stays earned)
  const streakRef = Math.max(stats.currentDailyStreak, stats.longestDailyStreak);
  if (streakRef >= 3)   has("streak_3");
  if (streakRef >= 7)   has("streak_7");
  if (streakRef >= 14)  has("streak_14");
  if (streakRef >= 30)  has("streak_30");
  if (streakRef >= 100) has("streak_100");

  // Consistency
  if (stats.perfectDays >= 1) has("perfect_day");
  if (stats.perfectDays >= 7) has("perfect_week");

  // Balance
  if (stats.badHabitAvoidanceDays >= 3) has("avoid_3");
  if (stats.badHabitAvoidanceDays >= 7) has("avoid_7");

  return unlocked;
}

/**
 * XP rewards for actions (separate from achievement rewards).
 */
export const XP_REWARDS = {
  goodHabitComplete: 10,
  badHabitAvoided:   15, // logging a "bad" habit as completed = the user avoided it
  dailyStreakBonus:   5, // applied once per day when streak ticks
} as const;

/**
 * Level curve: level = floor(sqrt(xp / 50)) + 1, starting at level 1.
 * XP required to reach level L (cumulative): 50 * (L - 1)^2
 */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1);
}

export function xpProgress(xp: number) {
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return {
    level,
    xpInLevel: xp - currentLevelXp,
    xpForNextLevel: nextLevelXp - currentLevelXp,
    percent: Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)),
  };
}
