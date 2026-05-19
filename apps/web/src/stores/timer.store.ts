import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TimeCategory } from "@/lib/api/timeEntries";

type TimerStatus = "idle" | "running" | "paused";

interface TimerState {
  status: TimerStatus;
  label: string;
  category: TimeCategory;
  startedAt: string | null;    // ISO — when the current run started
  pausedAt: string | null;     // ISO — when we paused
  accumulatedSec: number;      // seconds accumulated before the current run

  start: (label: string, category: TimeCategory) => void;
  pause: () => void;
  resume: () => void;
  stop: () => { label: string; category: TimeCategory; durationSec: number; startedAt: string; endedAt: string } | null;
  reset: () => void;
}

const DEFAULT: Pick<TimerState, "status" | "label" | "category" | "startedAt" | "pausedAt" | "accumulatedSec"> = {
  status: "idle",
  label: "",
  category: "productivity",
  startedAt: null,
  pausedAt: null,
  accumulatedSec: 0,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...DEFAULT,

      start(label, category) {
        set({ status: "running", label, category, startedAt: new Date().toISOString(), pausedAt: null, accumulatedSec: 0 });
      },

      pause() {
        const { status } = get();
        if (status !== "running") return;
        set({ status: "paused", pausedAt: new Date().toISOString() });
      },

      resume() {
        const { status, pausedAt, accumulatedSec, startedAt } = get();
        if (status !== "paused" || !pausedAt || !startedAt) return;
        const pausedSec = Math.floor((Date.now() - new Date(pausedAt).getTime()) / 1000);
        // Shift startedAt forward by the paused time so elapsed calculation stays correct
        const newStart = new Date(new Date(startedAt).getTime() + pausedSec * 1000).toISOString();
        set({ status: "running", pausedAt: null, startedAt: newStart });
      },

      stop() {
        const { status, label, category, startedAt, accumulatedSec } = get();
        if (status === "idle" || !startedAt) return null;

        const now = new Date();
        const runSec = Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1000);
        const totalSec = accumulatedSec + (status === "running" ? runSec : 0);

        if (totalSec < 5) {
          set(DEFAULT);
          return null;
        }

        const result = {
          label,
          category,
          durationSec: totalSec,
          startedAt,
          endedAt: now.toISOString(),
        };

        set(DEFAULT);
        return result;
      },

      reset() {
        set(DEFAULT);
      },
    }),
    {
      name: "timer-store",
    }
  )
);

// Derive elapsed seconds from the store state (call from a component with setInterval)
export function getElapsedSec(state: Pick<TimerState, "status" | "startedAt" | "pausedAt" | "accumulatedSec">): number {
  if (state.status === "idle") return 0;
  if (state.status === "paused" || !state.startedAt) return state.accumulatedSec;
  const runSec = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);
  return state.accumulatedSec + runSec;
}
