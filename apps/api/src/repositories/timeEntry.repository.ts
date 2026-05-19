import { db } from "../lib/db";

export interface CreateTimeEntryData {
  userId: string;
  label: string;
  category: string;
  durationSec: number;
  startedAt: Date;
  endedAt: Date;
  source: string;
}

export const timeEntryRepository = {
  findByUserAndDay(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return db.timeEntry.findMany({
      where: { userId, startedAt: { gte: start, lte: end } },
      orderBy: { startedAt: "desc" },
    });
  },

  findByUserAndRange(userId: string, from: Date, to: Date) {
    return db.timeEntry.findMany({
      where: { userId, startedAt: { gte: from, lte: to } },
      orderBy: { startedAt: "desc" },
    });
  },

  // Returns the distinct labels a user has used (for autocomplete)
  findDistinctLabels(userId: string) {
    return db.timeEntry.findMany({
      where: { userId },
      select: { label: true, category: true },
      distinct: ["label"],
      orderBy: { startedAt: "desc" },
      take: 50,
    });
  },

  create(data: CreateTimeEntryData) {
    return db.timeEntry.create({ data });
  },

  delete(id: string, userId: string) {
    return db.timeEntry.deleteMany({ where: { id, userId } });
  },
};
