import { db } from "../lib/db";

interface InsightData {
  userId: string;
  type: string;
  content: string;
  data: string;
}

export const insightRepository = {
  findActive(userId: string) {
    return db.insight.findMany({
      where: { userId, dismissed: false },
      orderBy: { createdAt: "desc" },
    });
  },

  createMany(items: InsightData[]) {
    return db.insight.createMany({ data: items });
  },

  dismiss(id: string, userId: string) {
    return db.insight.updateMany({
      where: { id, userId },
      data: { dismissed: true },
    });
  },

  deleteByUser(userId: string) {
    return db.insight.deleteMany({ where: { userId } });
  },
};
