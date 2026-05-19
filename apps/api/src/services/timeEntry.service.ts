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

  async delete(id: string, userId: string) {
    const result = await timeEntryRepository.delete(id, userId);
    if (result.count === 0) return false;
    return true;
  },
};
