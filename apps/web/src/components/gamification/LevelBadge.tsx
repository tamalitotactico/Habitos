"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelBadge({ level, size = "md", className }: Props) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(level);

  useEffect(() => {
    if (level > prev.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1200);
      prev.current = level;
      return () => clearTimeout(t);
    }
    prev.current = level;
  }, [level]);

  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-press",
        sizeClasses[size],
        className
      )}
    >
      <AnimatePresence>
        {pulse && (
          <motion.span
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 rounded-full bg-accent"
          />
        )}
      </AnimatePresence>
      <span className="relative font-display font-black tabular-nums leading-none drop-shadow-sm">
        {level}
      </span>
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-card px-1.5 py-0 text-[8px] font-bold uppercase tracking-widest text-muted-foreground border border-border">
        NV
      </span>
    </motion.div>
  );
}
