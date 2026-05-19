import bcrypt from "bcryptjs";
import { AppError } from "../middleware/error.middleware";
import { userRepository } from "../repositories/user.repository";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt";

const SALT_ROUNDS = 12;

function toPublicUser(user: { id: string; email: string; name: string; onboardedAt: Date | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    onboardedAt: user.onboardedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ email, passwordHash, name });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await userRepository.setRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await userRepository.setRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async refresh(incomingToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefresh(incomingToken);
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }

    const user = await userRepository.findByRefreshToken(incomingToken);
    if (!user || user.id !== payload.userId) {
      throw new AppError(401, "Refresh token reuse detected");
    }

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await userRepository.setRefreshToken(user.id, refreshToken);

    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async logout(userId: string) {
    await userRepository.setRefreshToken(userId, null);
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    return toPublicUser(user);
  },
};
