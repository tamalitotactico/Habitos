import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { verifyAccess } from "../lib/jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided");
    }
    const token = authHeader.slice(7);
    const payload = verifyAccess(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(401, "Invalid or expired token"));
  }
}
