import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { userStatsService } from "../services/userStats.service";
import { achievementService } from "../services/achievement.service";

const markNotifiedSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

export const gamificationController = {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userStatsService.get(req.userId!);
      res.json({ stats });
    } catch (err) { next(err); }
  },

  async listAchievements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const achievements = await achievementService.listForUser(req.userId!);
      res.json({ achievements });
    } catch (err) { next(err); }
  },

  async getPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pending = await achievementService.getUnnotified(req.userId!);
      res.json({ pending });
    } catch (err) { next(err); }
  },

  async markNotified(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids } = markNotifiedSchema.parse(req.body);
      const result = await achievementService.markNotified(req.userId!, ids);
      res.json({ marked: result.count });
    } catch (err) { next(err); }
  },
};
