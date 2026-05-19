import { db } from "../lib/db";

export const userRepository = {
  findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return db.user.findUnique({ where: { id } });
  },

  create(data: { email: string; passwordHash: string; name: string }) {
    return db.user.create({ data });
  },

  setRefreshToken(id: string, refreshToken: string | null) {
    return db.user.update({ where: { id }, data: { refreshToken } });
  },

  findByRefreshToken(refreshToken: string) {
    return db.user.findFirst({ where: { refreshToken } });
  },

  setOnboarded(id: string) {
    return db.user.update({
      where: { id },
      data: { onboardedAt: new Date() },
    });
  },
};
