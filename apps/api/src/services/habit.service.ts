import { AppError } from "../middleware/error.middleware";
import { habitRepository, CreateHabitData, UpdateHabitData } from "../repositories/habit.repository";
import { habitLogRepository } from "../repositories/habitLog.repository";

function startOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

// Returns current streak in days for a habit (consecutive completed days up to today)
async function calcStreak(habitId: string): Promise<number> {
  const logs = await habitLogRepository.findRecentByHabit(habitId, 90);
  if (!logs.length) return 0;

  let streak = 0;
  const today = startOfDay(new Date());

  for (let i = 0; i < 90; i++) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    const match = logs.find(
      (l) =>
        startOfDay(new Date(l.date)).getTime() === target.getTime() &&
        l.completed
    );
    if (match) {
      streak++;
    } else {
      // Allow one gap for "today not yet logged"
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

// Adherence % over the last 30 days
async function calcAdherence(habitId: string, frequency: number): Promise<number> {
  const to = startOfDay(new Date());
  const from = new Date(to);
  from.setDate(from.getDate() - 29);

  const logs = await habitLogRepository.findByHabitAndRange(habitId, from, to);
  const completed = logs.filter((l) => l.completed).length;

  // Expected completions over 30 days based on weekly frequency
  const expected = Math.round((frequency / 7) * 30);
  if (expected === 0) return 100;
  return Math.min(100, Math.round((completed / expected) * 100));
}

export const habitService = {
  async getAll(userId: string, includeArchived: boolean) {
    const habits = await habitRepository.findAllByUser(userId, includeArchived);
    const withStats = await Promise.all(
      habits.map(async (h) => ({
        ...h,
        createdAt: h.createdAt.toISOString(),
        streak: await calcStreak(h.id),
        adherence: await calcAdherence(h.id, h.frequency),
      }))
    );
    return withStats;
  },

  async create(userId: string, data: Omit<CreateHabitData, "userId">) {
    const habit = await habitRepository.create({ ...data, userId });
    return { ...habit, createdAt: habit.createdAt.toISOString(), streak: 0, adherence: 0 };
  },

  async update(id: string, userId: string, data: UpdateHabitData) {
    const existing = await habitRepository.findById(id, userId);
    if (!existing) throw new AppError(404, "Habit not found");
    const updated = await habitRepository.update(id, userId, data);
    return { ...updated, createdAt: updated.createdAt.toISOString() };
  },

  async archive(id: string, userId: string) {
    const existing = await habitRepository.findById(id, userId);
    if (!existing) throw new AppError(404, "Habit not found");
    return habitRepository.archive(id, userId);
  },

  // Get today's habits with their log status
  async getToday(userId: string) {
    const habits = await habitRepository.findAllByUser(userId, false);
    if (!habits.length) return [];

    const today = startOfDay(new Date());
    const logs = await habitLogRepository.findByHabitsAndDate(
      habits.map((h) => h.id),
      today
    );

    const logMap = new Map(logs.map((l) => [l.habitId, l]));

    return Promise.all(
      habits.map(async (h) => {
        const log = logMap.get(h.id);
        return {
          ...h,
          createdAt: h.createdAt.toISOString(),
          streak: await calcStreak(h.id),
          todayLog: log
            ? {
                id: log.id,
                completed: log.completed,
                duration: log.duration,
                note: log.note,
              }
            : null,
        };
      })
    );
  },
};
