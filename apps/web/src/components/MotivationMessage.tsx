"use client";

import { Heart, Sparkles, Sunrise, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Mood = "missed" | "behind" | "started" | "good" | "great";

interface Props {
  mood: Mood;
  className?: string;
}

const MESSAGES: Record<Mood, { text: string; icon: typeof Heart }[]> = {
  missed: [
    { text: "Mañana continuamos. Tu progreso no desaparece.", icon: Sunrise },
    { text: "Un día no rompe la historia. Vuelve cuando puedas.", icon: Heart },
    { text: "Cada intento cuenta, también los días difíciles.", icon: Heart },
  ],
  behind: [
    { text: "Vas más despacio hoy, y está bien.", icon: Heart },
    { text: "El ritmo importa menos que volver.", icon: ArrowRight },
  ],
  started: [
    { text: "Empezar ya es la mitad. Sigue.", icon: ArrowRight },
    { text: "Lo difícil fue empezar. Ahora solo seguir.", icon: Sparkles },
  ],
  good: [
    { text: "Vas mejorando, día a día.", icon: Sparkles },
    { text: "Cada hábito es un voto por quien quieres ser.", icon: Sparkles },
  ],
  great: [
    { text: "¡Estás en racha! No pierdas este momentum.", icon: Sparkles },
    { text: "Hoy fue de los buenos. Disfrútalo.", icon: Heart },
  ],
};

// Deterministic message picker — stable within the day
function pickMessage(mood: Mood): { text: string; icon: typeof Heart } {
  const list = MESSAGES[mood];
  const dayIndex = new Date().getDate();
  return list[dayIndex % list.length];
}

export function MotivationMessage({ mood, className }: Props) {
  const { text, icon: Icon } = pickMessage(mood);
  return (
    <div className={cn(
      "flex items-start gap-2 rounded-2xl border-2 border-primary/20 bg-primary/[0.04] p-3",
      className
    )}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="currentColor" />
      <p className="text-sm font-medium leading-snug">{text}</p>
    </div>
  );
}

/**
 * Pick a mood based on today's completion and streak state.
 */
export function pickMood({
  completed,
  total,
  streak,
}: { completed: number; total: number; streak: number }): Mood {
  if (total === 0) return "started";
  const ratio = completed / total;
  if (ratio === 1) return "great";
  if (ratio >= 0.5) return "good";
  if (ratio > 0) return "started";
  // Nothing done
  if (streak === 0) return "missed";
  return "behind";
}
