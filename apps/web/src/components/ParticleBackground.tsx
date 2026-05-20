"use client";

import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface Props {
  className?: string;
  variant?: "ambient" | "celebrate";
}

async function initEngine(engine: Engine) {
  await loadSlim(engine);
}

/**
 * Ambient floating particles for hero/decorative backgrounds.
 */
export function ParticleBackground({ className, variant = "ambient" }: Props) {
  const isAmbient = variant === "ambient";

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id={`particles-${variant}`}
        className={className}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            number: {
              value: isAmbient ? 14 : 30,
              density: { enable: true },
            },
            color: {
              value: ["#FFB627", "#FF6B5A", "#22C56E"],
            },
            shape: { type: "circle" },
            opacity: {
              value: { min: 0.15, max: 0.45 },
              animation: { enable: true, speed: 0.6, sync: false },
            },
            size: {
              value: { min: 2, max: 5 },
            },
            move: {
              enable: true,
              speed: isAmbient ? 0.6 : 1.8,
              direction: "top",
              random: true,
              straight: false,
              outModes: { default: "out" },
            },
          },
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
            },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  );
}
