/**
 * Seed 30 days of realistic demo data for the first user in the DB.
 * Run from apps/api: npx ts-node -r dotenv/config src/scripts/seed-demo.ts
 *
 * Pattern:
 *  Mon–Wed : work 7–9h, productivity 1–2h, habits ~85% done
 *  Thu–Fri : work 6–8h, entertainment 1.5–2h, habits ~55% done
 *  Sat–Sun : entertainment 4–5h, social 2–3h, habits ~25% done
 *  Last 2 days: no habit completions (triggers gap alert)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function jitter(base: number, pct = 0.2): number {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct));
}

function dayStart(d: Date): Date {
  const r = new Date(d);
  r.setHours(8, 0, 0, 0);
  return r;
}

interface EntryDef {
  category: string;
  durationSec: number;
  label: string;
}

const DOW_SCHEDULE: Record<number, EntryDef[]> = {
  // Sun
  0: [
    { category: "entertainment", durationSec: 4.5 * 3600, label: "Series / películas" },
    { category: "social",        durationSec: 2.5 * 3600, label: "Salida con amigos" },
  ],
  // Mon
  1: [
    { category: "work",         durationSec: 8 * 3600,   label: "Trabajo" },
    { category: "productivity", durationSec: 1.5 * 3600, label: "Planificación semanal" },
  ],
  // Tue
  2: [
    { category: "work",         durationSec: 7 * 3600,   label: "Trabajo" },
    { category: "productivity", durationSec: 2 * 3600,   label: "Proyectos personales" },
  ],
  // Wed
  3: [
    { category: "work",         durationSec: 8.5 * 3600, label: "Trabajo" },
    { category: "productivity", durationSec: 1 * 3600,   label: "Estudio" },
  ],
  // Thu
  4: [
    { category: "work",          durationSec: 7.5 * 3600, label: "Trabajo" },
    { category: "entertainment", durationSec: 1.5 * 3600, label: "Videojuegos" },
  ],
  // Fri
  5: [
    { category: "work",          durationSec: 6 * 3600,   label: "Trabajo" },
    { category: "entertainment", durationSec: 4 * 3600,   label: "Series / videojuegos" },
    { category: "social",        durationSec: 2.5 * 3600, label: "Salida nocturna" },
  ],
  // Sat
  6: [
    { category: "entertainment", durationSec: 5 * 3600,   label: "Series / películas" },
    { category: "social",        durationSec: 3 * 3600,   label: "Reunión familiar" },
  ],
};

// Habit completion rate by day of week (0 = Sun)
const HABIT_RATE: Record<number, number> = {
  0: 0.25,
  1: 0.88,
  2: 0.92,
  3: 0.82,
  4: 0.58,
  5: 0.42,
  6: 0.22,
};

const DEMO_HABITS = [
  { name: "Meditación",  type: "good", frequency: 7 },
  { name: "Ejercicio",   type: "good", frequency: 7 },
  { name: "Lectura",     type: "good", frequency: 7 },
];

async function main() {
  const user = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) {
    console.error("No user found. Register an account first, then run this seed.");
    process.exit(1);
  }
  console.log(`Seeding demo data for user: ${user.email}`);

  // Ensure demo habits exist
  const existingHabits = await db.habit.findMany({
    where: { userId: user.id, isArchived: false },
  });
  const habits =
    existingHabits.length > 0
      ? existingHabits
      : await Promise.all(
          DEMO_HABITS.map((h) =>
            db.habit.create({ data: { ...h, userId: user.id } })
          )
        );
  console.log(`Using ${habits.length} habits.`);

  const now = new Date();

  // Remove old seed data (last 32 days) to allow re-running
  const seedFrom = subDays(now, 32);
  await db.timeEntry.deleteMany({
    where: { userId: user.id, startedAt: { gte: seedFrom } },
  });
  await db.habitLog.deleteMany({
    where: {
      habitId: { in: habits.map((h) => h.id) },
      date: { gte: seedFrom },
    },
  });

  // Generate 30 days (oldest first, skip today)
  for (let i = 30; i >= 1; i--) {
    const date = subDays(now, i);
    const dow = date.getDay();
    const isLastTwoDays = i <= 2; // no habit completions for gap alert

    // Time entries
    const schedule = DOW_SCHEDULE[dow] ?? [];
    let cursor = dayStart(date).getTime();
    for (const def of schedule) {
      const dur = jitter(def.durationSec);
      const startedAt = new Date(cursor);
      const endedAt = new Date(cursor + dur * 1000);
      await db.timeEntry.create({
        data: {
          userId: user.id,
          label: def.label,
          category: def.category,
          durationSec: dur,
          startedAt,
          endedAt,
          source: "manual",
        },
      });
      cursor = endedAt.getTime() + 10 * 60 * 1000; // 10 min gap
    }

    // Habit logs
    const rate = isLastTwoDays ? 0 : (HABIT_RATE[dow] ?? 0.5);
    for (const habit of habits) {
      const completed = Math.random() < rate;
      // Normalise to midnight for SQLite compatibility
      const logDate = new Date(date);
      logDate.setHours(0, 0, 0, 0);
      await db.habitLog.create({
        data: { habitId: habit.id, date: logDate, completed },
      });
    }
  }

  console.log("Seed complete. Run POST /insights/generate to see your insights.");
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  db.$disconnect();
  process.exit(1);
});
