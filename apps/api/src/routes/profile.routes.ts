import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { profileController } from "../controllers/profile.controller";

export const profileRouter = Router();

profileRouter.get("/", authenticate, profileController.getProfile);
profileRouter.post("/diagnosis/generate", authenticate, profileController.generateDiagnosis);
