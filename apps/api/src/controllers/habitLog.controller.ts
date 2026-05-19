import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { habitLogService } from "../services/habitLog.service";

const upsertSchema = z.object({
  habitId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  completed: z.boolean(),
  duration: z.number().int().positive().optional(),
  note: z.string().max(500).optional(),
});

const historySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const habitLogController = {
  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { habitId, date, completed, duration, note } = upsertSchema.parse(req.body);
      const log = await habitLogService.upsert(req.userId!, habitId, {
        date,
        completed,
        duration,
        note,
      });
      res.json({ log });
    } catch (err) { next(err); }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { from, to } = historySchema.parse({ from: String(req.query.from), to: String(req.query.to) });
      const logs = await habitLogService.getHistory(
        req.userId!,
        String(req.params.habitId),
        from,
        to
      );
      res.json({ logs });
    } catch (err) { next(err); }
  },
};
