import { db } from "../lib/db";

export const challengeRepository = {
  findActiveForUser(userId: string, now: Date) {
    return db.challengeAssignment.findMany({
      where: { userId, expiresAt: { gte: now } },
      orderBy: { type: "asc" },
    });
  },

  findByPeriod(userId: string, type: "daily" | "weekly", periodKey: string) {
    return db.challengeAssignment.findUnique({
      where: { userId_type_periodKey: { userId, type, periodKey } },
    });
  },

  create(data: {
    userId: string;
    challengeKey: string;
    type: string;
    periodKey: string;
    expiresAt: Date;
  }) {
    return db.challengeAssignment.create({ data });
  },

  markComplete(id: string) {
    return db.challengeAssignment.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  },
};
