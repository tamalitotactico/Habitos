import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { habitService } from "../services/habit.service";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["good", "bad"]),
  frequency: z.number().int().min(1).max(7),
  targetDuration: z.number().int().positive().optional(),
  trigger: z.string().max(300).optional(),
  replacementFor: z.string().uuid().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  frequency: z.number().int().min(1).max(7).optional(),
  targetDuration: z.number().int().positive().nullable().optional(),
  trigger: z.string().max(300).nullable().optional(),
  isArchived: z.boolean().optional(),
});

export const habitController = {
  async getToday(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const habits = await habitService.getToday(req.userId!);
      res.json({ habits });
    } catch (err) { next(err); }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const includeArchived = String(req.query.archived) === "true";
      const habits = await habitService.getAll(req.userId!, includeArchived);
      res.json({ habits });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const habit = await habitService.create(req.userId!, data);
      res.status(201).json({ habit });
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const habit = await habitService.update(String(req.params.id), req.userId!, data);
      res.json({ habit });
    } catch (err) { next(err); }
  },

  async archive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await habitService.archive(String(req.params.id), req.userId!);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
