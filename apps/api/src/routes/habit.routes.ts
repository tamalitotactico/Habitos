import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

export const habitRouter = Router();

habitRouter.use(authenticate);

// Stubs — se implementan en Sprint 2
habitRouter.get("/", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
habitRouter.post("/", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
habitRouter.patch("/:id", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
habitRouter.delete("/:id", (_req, res) => res.status(501).json({ message: "Sprint 2" }));
