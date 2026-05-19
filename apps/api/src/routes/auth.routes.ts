import { Router } from "express";

export const authRouter = Router();

// Stubs — se implementan en Sprint 1
authRouter.post("/register", (_req, res) => {
  res.status(501).json({ message: "Sprint 1" });
});

authRouter.post("/login", (_req, res) => {
  res.status(501).json({ message: "Sprint 1" });
});

authRouter.post("/refresh", (_req, res) => {
  res.status(501).json({ message: "Sprint 1" });
});

authRouter.post("/logout", (_req, res) => {
  res.status(501).json({ message: "Sprint 1" });
});
