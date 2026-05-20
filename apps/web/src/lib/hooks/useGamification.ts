"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamificationApi } from "@/lib/api/gamification";

export const STATS_KEY = ["gamification", "stats"] as const;
export const ACHIEVEMENTS_KEY = ["gamification", "achievements"] as const;
export const PENDING_KEY = ["gamification", "pending"] as const;
export const CHALLENGES_KEY = ["gamification", "challenges"] as const;
export const CALENDAR_KEY = ["gamification", "calendar"] as const;

export function useStats() {
  return useQuery({
    queryKey: STATS_KEY,
    queryFn: () => gamificationApi.getStats().then((r) => r.data.stats),
    staleTime: 30 * 1000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ACHIEVEMENTS_KEY,
    queryFn: () => gamificationApi.listAchievements().then((r) => r.data.achievements),
    staleTime: 60 * 1000,
  });
}

export function usePendingAchievements() {
  return useQuery({
    queryKey: PENDING_KEY,
    queryFn: () => gamificationApi.getPending().then((r) => r.data.pending),
    refetchInterval: 8 * 1000,
  });
}

export function useMarkNotified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => gamificationApi.markNotified(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENDING_KEY });
    },
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: CHALLENGES_KEY,
    queryFn: () => gamificationApi.getChallenges().then((r) => r.data.challenges),
    staleTime: 30 * 1000,
  });
}

export function useCalendar() {
  return useQuery({
    queryKey: CALENDAR_KEY,
    queryFn: () => gamificationApi.getCalendar().then((r) => r.data.days),
    staleTime: 60 * 1000,
  });
}
