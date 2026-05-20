import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { gamificationController } from "../controllers/gamification.controller";

export const gamificationRouter = Router();

gamificationRouter.use(authenticate);

gamificationRouter.get("/stats", gamificationController.getStats);
gamificationRouter.get("/achievements", gamificationController.listAchievements);
gamificationRouter.get("/achievements/pending", gamificationController.getPending);
gamificationRouter.post("/achievements/notified", gamificationController.markNotified);
gamificationRouter.get("/challenges", gamificationController.getChallenges);
gamificationRouter.get("/calendar", gamificationController.getCalendar);
