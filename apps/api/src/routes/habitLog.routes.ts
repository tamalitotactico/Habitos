import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

export const habitLogRouter = Router();

habitLogRouter.use(authenticate);

// Stubs — se implementan en Sprint 2
habitLogRouter.get("/", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
habitLogRouter.post("/", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
