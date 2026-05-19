import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { timeEntryService } from "../services/timeEntry.service";
import { AppError } from "../middleware/error.middleware";

const CATEGORIES = ["social", "work", "entertainment", "productivity", "other"] as const;
const SOURCES = ["manual", "timer", "extension"] as const;

const createSchema = z.object({
  label: z.string().min(1).max(100),
  category: z.enum(CATEGORIES),
  durationSec: z.number().int().positive(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  source: z.enum(SOURCES).default("manual"),
});

const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const updateSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  category: z.enum(CATEGORIES).optional(),
});

export const timeEntryController = {
  async getToday(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await timeEntryService.getToday(req.userId!);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getRange(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { from, to } = rangeSchema.parse({
        from: String(req.query.from),
        to: String(req.query.to),
      });
      const entries = await timeEntryService.getRange(req.userId!, from, to);
      res.json({ entries });
    } catch (err) { next(err); }
  },

  async getLabels(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const labels = await timeEntryService.getLabels(req.userId!);
      res.json({ labels });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const entry = await timeEntryService.create(req.userId!, {
        ...body,
        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),
      });
      res.status(201).json({ entry });
    } catch (err) { next(err); }
  },

  async getWeekly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await timeEntryService.getWeekly(req.userId!);
      res.json(data);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = updateSchema.parse(req.body);
      const updated = await timeEntryService.update(String(req.params.id), req.userId!, body);
      if (!updated) throw new AppError(404, "Entry not found");
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await timeEntryService.delete(
        String(req.params.id),
        req.userId!
      );
      if (!deleted) throw new AppError(404, "Entry not found");
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
