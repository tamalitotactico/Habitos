import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { timeEntryController } from "../controllers/timeEntry.controller";

export const timeEntryRouter = Router();

timeEntryRouter.use(authenticate);

timeEntryRouter.get("/today", timeEntryController.getToday);
timeEntryRouter.get("/weekly", timeEntryController.getWeekly);
timeEntryRouter.get("/labels", timeEntryController.getLabels);
timeEntryRouter.get("/", timeEntryController.getRange);
timeEntryRouter.post("/", timeEntryController.create);
timeEntryRouter.patch("/:id", timeEntryController.update);
timeEntryRouter.delete("/:id", timeEntryController.delete);
