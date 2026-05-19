import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { insightController } from "../controllers/insight.controller";

export const insightRouter = Router();

insightRouter.use(authenticate);

insightRouter.get("/", insightController.getActive);
insightRouter.post("/generate", insightController.generate);
insightRouter.patch("/:id/dismiss", insightController.dismiss);
