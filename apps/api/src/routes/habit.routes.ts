import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { habitController } from "../controllers/habit.controller";

export const habitRouter = Router();

habitRouter.use(authenticate);

habitRouter.get("/today", habitController.getToday);
habitRouter.get("/", habitController.getAll);
habitRouter.post("/", habitController.create);
habitRouter.patch("/:id", habitController.update);
habitRouter.delete("/:id", habitController.archive);
