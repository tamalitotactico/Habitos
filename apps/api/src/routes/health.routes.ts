import { Router } from "express";
import { db } from "../lib/db";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});
