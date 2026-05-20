"use client";

import {
  Sprout, CheckCheck, Award, Trophy, Crown,
  Flame, Sparkles, Star, Sun, Medal, Shield, ShieldCheck,
  Award as Fallback,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Sprout, CheckCheck, Award, Trophy, Crown,
  Flame, Sparkles, Star, Sun, Medal, Shield, ShieldCheck,
};

interface Props {
  name: string;
  className?: string;
  strokeWidth?: number;
}

export function AchievementIcon({ name, className, strokeWidth = 2 }: Props) {
  const Icon = ICON_MAP[name] ?? Fallback;
  return <Icon className={cn(className)} strokeWidth={strokeWidth} />;
}
