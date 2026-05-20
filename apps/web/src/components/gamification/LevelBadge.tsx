"use client";

import { cn } from "@/lib/utils";

interface Props {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelBadge({ level, size = "md", className }: Props) {
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-press",
        sizeClasses[size],
        className
      )}
    >
      <span className="font-display font-black tabular-nums leading-none drop-shadow-sm">
        {level}
      </span>
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-card px-1.5 py-0 text-[8px] font-bold uppercase tracking-widest text-muted-foreground border border-border">
        NV
      </span>
    </div>
  );
}
