import { db } from "../lib/db";

export interface CreateHabitData {
  userId: string;
  name: string;
  type: string;
  frequency: number;
  targetDuration?: number;
  trigger?: string;
  replacementFor?: string;
}

export interface UpdateHabitData {
  name?: string;
  frequency?: number;
  targetDuration?: number | null;
  trigger?: string | null;
  isArchived?: boolean;
}

export const habitRepository = {
  findAllByUser(userId: string, includeArchived = false) {
    return db.habit.findMany({
      where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string, userId: string) {
    return db.habit.findFirst({ where: { id, userId } });
  },

  create(data: CreateHabitData) {
    return db.habit.create({ data });
  },

  update(id: string, userId: string, data: UpdateHabitData) {
    return db.habit.update({ where: { id }, data });
  },

  // Soft-delete via isArchived
  archive(id: string, userId: string) {
    return db.habit.update({
      where: { id },
      data: { isArchived: true },
    });
  },
};
