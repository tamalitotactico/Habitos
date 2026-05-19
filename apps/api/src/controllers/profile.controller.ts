import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { profileService } from "../services/profile.service";

export const profileController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getProfile(req.userId!);
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  },

  // TODO: Connect to Claude API (Sprint 5 - Anthropic integration pending)
  async generateDiagnosis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.generateDiagnosis(req.userId!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
