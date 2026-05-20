"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  xpInLevel: number;
  xpForNextLevel: number;
  percent: number;
  className?: string;
  size?: "sm" | "md";
}

export function XPBar({ xpInLevel, xpForNextLevel, percent, className, size = "md" }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-display text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          <Zap className="h-3 w-3 text-accent" fill="currentColor" />
          XP
        </span>
        <span className={cn(
          "font-display font-black tabular-nums text-foreground",
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {xpInLevel} <span className="text-muted-foreground">/ {xpForNextLevel}</span>
        </span>
      </div>
      <div className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        size === "sm" ? "h-2" : "h-3"
      )}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-accent transition-all duration-700 ease-out"
          style={{ width: `${Math.max(2, percent)}%` }}
        />
        {/* shimmer */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{
            animation: "xp-shimmer 2.6s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes xp-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
