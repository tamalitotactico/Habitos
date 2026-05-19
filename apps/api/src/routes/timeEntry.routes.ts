import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

export const timeEntryRouter = Router();

timeEntryRouter.use(authenticate);

// Stubs — se implementan en Sprint 3
timeEntryRouter.get("/", (_req, res) => res.status(501).json({ message: "Sprint 3" }));
timeEntryRouter.post("/", (_req, res) => res.status(501).json({ message: "Sprint 3" }));
timeEntryRouter.delete("/:id", (_req, res) => res.status(501).json({ message: "Sprint 3" }));
