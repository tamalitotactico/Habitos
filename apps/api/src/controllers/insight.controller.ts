import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { insightService } from "../services/insight.service";

export const insightController = {
  async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await insightService.getActive(req.userId!);
      res.json({ insights });
    } catch (err) {
      next(err);
    }
  },

  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await insightService.generate(req.userId!);
      res.json({ insights });
    } catch (err) {
      next(err);
    }
  },

  async dismiss(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await insightService.dismiss(id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
