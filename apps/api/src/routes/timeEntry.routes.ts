import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { timeEntryController } from "../controllers/timeEntry.controller";

export const timeEntryRouter = Router();

timeEntryRouter.use(authenticate);

timeEntryRouter.get("/today", timeEntryController.getToday);
timeEntryRouter.get("/", timeEntryController.getRange);
timeEntryRouter.get("/labels", timeEntryController.getLabels);
timeEntryRouter.post("/", timeEntryController.create);
timeEntryRouter.delete("/:id", timeEntryController.delete);
