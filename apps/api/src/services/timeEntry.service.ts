import { timeEntryRepository, CreateTimeEntryData } from "../repositories/timeEntry.repository";

const VALID_CATEGORIES = ["social", "work", "entertainment", "productivity", "other"] as const;
type Category = typeof VALID_CATEGORIES[number];

function serializeEntry(e: {
  id: string; userId: string; label: string; category: string;
  durationSec: number; startedAt: Date; endedAt: Date; source: string;
}) {
  return {
    ...e,
    startedAt: e.startedAt.toISOString(),
    endedAt: e.endedAt.toISOString(),
  };
}

export const timeEntryService = {
  async getToday(userId: string) {
    const entries = await timeEntryRepository.findByUserAndDay(userId, new Date());
    const serialized = entries.map(serializeEntry);

    // Aggregate totals by category
    const byCategory = VALID_CATEGORIES.map((cat) => ({
      category: cat,
      totalSec: serialized
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.durationSec, 0),
    }));

    const totalSec = serialized.reduce((sum, e) => sum + e.durationSec, 0);

    return { entries: serialized, byCategory, totalSec };
  },

  async getRange(userId: string, from: string, to: string) {
    const entries = await timeEntryRepository.findByUserAndRange(
      userId,
      new Date(from),
      new Date(to)
    );
    return entries.map(serializeEntry);
  },

  async getLabels(userId: string) {
    return timeEntryRepository.findDistinctLabels(userId);
  },

  async create(userId: string, data: Omit<CreateTimeEntryData, "userId">) {
    const entry = await timeEntryRepository.create({ ...data, userId });
    return serializeEntry(entry);
  },

  async getWeekly(userId: string) {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date();
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    const entries = await timeEntryRepository.findByUserAndRange(userId, from, to);

    const days: {
      date: string;
      label: string;
      social: number; work: number; entertainment: number; productivity: number; other: number;
      total: number;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayEntries = entries.filter((e) => e.startedAt.toISOString().startsWith(dateStr));

      const row = {
        date: dateStr,
        label: d.toLocaleDateString("es", { weekday: "short" }),
        social: 0, work: 0, entertainment: 0, productivity: 0, other: 0, total: 0,
      };

      for (const e of dayEntries) {
        const cat = e.category as Category;
        if (cat in row) (row as unknown as Record<string, number>)[cat] += e.durationSec;
        row.total += e.durationSec;
      }
      days.push(row);
    }

    return { days };
  },

  async update(id: string, userId: string, data: { label?: string; category?: string }) {
    const result = await timeEntryRepository.update(id, userId, data);
    if (result.count === 0) return false;
    return true;
  },

  async delete(id: string, userId: string) {
    const result = await timeEntryRepository.delete(id, userId);
    if (result.count === 0) return false;
    return true;
  },
};
