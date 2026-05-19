import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  path: "/auth/refresh",
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const onboardSchema = z.object({
  goals: z.array(z.string().min(1)).min(1, "Select at least one goal"),
  availableMinutesPerDay: z.number().int().min(5).max(480),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(email, password, name);
      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.status(201).json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(email, password);
      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (!token) {
        res.status(401).json({ error: "No refresh token" });
        return;
      }
      const { user, accessToken, refreshToken } = await authService.refresh(token);
      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
      res.json({ user, accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.userId) await authService.logout(req.userId);
      res.clearCookie(REFRESH_COOKIE, { path: "/auth/refresh" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.userId!);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },

  async onboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { goals, availableMinutesPerDay } = onboardSchema.parse(req.body);
      const user = await authService.onboard(req.userId!, goals, availableMinutesPerDay);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
};
