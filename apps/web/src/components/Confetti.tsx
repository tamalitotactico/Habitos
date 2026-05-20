"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface Props {
  show: boolean;
}

const COLORS = [
  "#FF6B5A", // coral
  "#FFB627", // amber
  "#22C56E", // emerald
  "#3DC9C2", // teal
  "#FF7AD9", // pink
  "#FFFFFF",
];

/**
 * Realistic confetti burst using canvas-confetti.
 * Fires a multi-stage cannon when show transitions to true.
 */
export function Confetti({ show }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (!show) {
      fired.current = false;
      return;
    }
    if (fired.current) return;
    fired.current = true;

    // Two side cannons + center burst
    const end = Date.now() + 1200;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0, y: 0.7 },
        colors: COLORS,
        scalar: 1.1,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 1, y: 0.7 },
        colors: COLORS,
        scalar: 1.1,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Center burst slightly delayed
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.4 },
        colors: COLORS,
        scalar: 1.3,
      });
    }, 250);
  }, [show]);

  return null;
}
