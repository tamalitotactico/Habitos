import { achievementRepository } from "../repositories/achievement.repository";
import { userStatsService } from "./userStats.service";
import { ACHIEVEMENTS, evaluateUnlocks, ACHIEVEMENT_BY_KEY } from "../domain/achievement.catalog";
import { userStatsRepository } from "../repositories/userStats.repository";

export const achievementService = {
  /**
   * Returns all achievement definitions plus user's unlock state.
   */
  async listForUser(userId: string) {
    const unlocks = await achievementRepository.findByUserId(userId);
    const unlockedKeys = new Map(unlocks.map((u) => [u.achievementKey, u.unlockedAt]));
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedKeys.has(a.key),
      unlockedAt: unlockedKeys.get(a.key)?.toISOString() ?? null,
    }));
  },

  /**
   * Returns achievements unlocked but not yet shown to the user.
   * Caller is responsible for marking them notified after display.
   */
  async getUnnotified(userId: string) {
    const items = await achievementRepository.findUnnotified(userId);
    return items
      .map((u) => {
        const def = ACHIEVEMENT_BY_KEY.get(u.achievementKey);
        return def ? { ...def, id: u.id, unlockedAt: u.unlockedAt.toISOString() } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  },

  async markNotified(userId: string, ids: string[]) {
    // Constrain to user's own unlocks
    const userUnlocks = await achievementRepository.findByUserId(userId);
    const valid = userUnlocks.filter((u) => ids.includes(u.id)).map((u) => u.id);
    return achievementRepository.markNotified(valid);
  },

  /**
   * Evaluate the user's full snapshot, persist any new unlocks, and award their bonus XP.
   * Returns the list of *newly* unlocked achievements (may be empty).
   */
  async checkAndUnlock(userId: string) {
    const snapshot = await userStatsService.snapshot(userId);
    const earned = evaluateUnlocks(snapshot);

    const existing = await achievementRepository.findByUserId(userId);
    const existingKeys = new Set(existing.map((u) => u.achievementKey));

    const newKeys = Array.from(earned).filter((k) => !existingKeys.has(k));
    if (newKeys.length === 0) return [];

    await achievementRepository.createMany(
      newKeys.map((achievementKey) => ({ userId, achievementKey }))
    );

    // Award XP bonus per achievement
    const bonusXp = newKeys.reduce(
      (sum, k) => sum + (ACHIEVEMENT_BY_KEY.get(k)?.xpReward ?? 0),
      0
    );
    if (bonusXp > 0) {
      const stats = await userStatsRepository.ensureExists(userId);
      await userStatsRepository.upsert(userId, { xp: stats.xp + bonusXp });
    }

    return newKeys.map((k) => ACHIEVEMENT_BY_KEY.get(k)!).filter(Boolean);
  },
};
