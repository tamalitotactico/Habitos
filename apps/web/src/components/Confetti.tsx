"use client";

import { useMemo } from "react";

interface Props {
  show: boolean;
  count?: number;
}

const COLORS = [
  "oklch(0.52 0.115 152)",  // sage
  "oklch(0.78 0.155 70)",   // amber
  "oklch(0.62 0.13 145)",   // green
  "oklch(0.70 0.18 30)",    // coral
  "oklch(0.80 0.14 200)",   // sky
];

/**
 * CSS-only confetti burst. Mount with show=true to trigger.
 * Each piece picks a random color, x-offset, duration, and rotation.
 */
export function Confetti({ show, count = 36 }: Props) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const xDrift = (Math.random() - 0.5) * 240;
      const duration = 1.6 + Math.random() * 1.4;
      const delay = Math.random() * 0.25;
      const size = 6 + Math.random() * 8;
      const color = COLORS[i % COLORS.length];
      const isCircle = Math.random() > 0.5;
      return { left, xDrift, duration, delay, size, color, isCircle, i };
    });
  }, [count]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.i}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            ["--confetti-x" as string]: `${p.xDrift}px`,
            ["--confetti-duration" as string]: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
