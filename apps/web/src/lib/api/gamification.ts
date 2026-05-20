import { api } from "./client";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementCategory = "completion" | "streak" | "consistency" | "balance";

export interface UserStats {
  xp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  percentToNextLevel: number;
  lifetimeCompletions: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  lastActiveDate: string | null;
  streakFreezesAvailable: number;
}

export type ChallengeType = "daily" | "weekly";

export interface Challenge {
  id: string;
  type: ChallengeType;
  challenge: {
    key: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
  };
  progress: number;
  goal: number;
  percent: number;
  completed: boolean;
  completedAt: string | null;
  expiresAt: string;
}

export interface CalendarDay {
  date: string;
  completed: number;
  total: number;
  ratio: number;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface PendingAchievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt: string;
}

export const gamificationApi = {
  getStats: () => api.get<{ stats: UserStats }>("/gamification/stats"),
  listAchievements: () => api.get<{ achievements: Achievement[] }>("/gamification/achievements"),
  getPending: () => api.get<{ pending: PendingAchievement[] }>("/gamification/achievements/pending"),
  markNotified: (ids: string[]) =>
    api.post<{ marked: number }>("/gamification/achievements/notified", { ids }),
  getChallenges: () => api.get<{ challenges: Challenge[] }>("/gamification/challenges"),
  getCalendar: () => api.get<{ days: CalendarDay[] }>("/gamification/calendar"),
};
