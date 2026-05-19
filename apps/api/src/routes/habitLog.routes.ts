import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { habitLogController } from "../controllers/habitLog.controller";

export const habitLogRouter = Router();

habitLogRouter.use(authenticate);

habitLogRouter.post("/", habitLogController.upsert);
habitLogRouter.get("/:habitId/history", habitLogController.getHistory);
