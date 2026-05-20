"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { PALETTE_THEMES, PaletteTheme } from "@/lib/providers";

const PALETTE_META: Record<
  PaletteTheme,
  { label: string; description: string; swatches: [string, string, string] }
> = {
  coral: {
    label: "Coral & Sol",
    description: "Cálido, optimista, energético",
    swatches: ["oklch(0.68 0.20 28)", "oklch(0.86 0.18 90)", "oklch(0.99 0.012 75)"],
  },
  berry: {
    label: "Frutos del bosque",
    description: "Atrevido, mágico, vibrante",
    swatches: ["oklch(0.60 0.24 340)", "oklch(0.78 0.16 290)", "oklch(0.99 0.012 330)"],
  },
  ocean: {
    label: "Brisa marina",
    description: "Fresco, claro, sereno",
    swatches: ["oklch(0.60 0.16 210)", "oklch(0.72 0.20 30)", "oklch(0.99 0.012 215)"],
  },
  sunset: {
    label: "Atardecer",
    description: "Cálido, romántico, intenso",
    swatches: ["oklch(0.66 0.21 45)", "oklch(0.68 0.24 0)", "oklch(0.985 0.018 55)"],
  },
  lime: {
    label: "Lima eléctrica",
    description: "Audaz, jugoso, electrizante",
    swatches: ["oklch(0.76 0.22 135)", "oklch(0.60 0.22 240)", "oklch(0.99 0.018 130)"],
  },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const current = (theme as PaletteTheme) ?? "coral";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-black tracking-wide">
          Paleta de colores
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PALETTE_THEMES.map((key) => {
          const meta = PALETTE_META[key];
          const active = current === key;
          const [c1, c2, c3] = meta.swatches;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left transition-all",
                active
                  ? "border-primary shadow-press"
                  : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
              )}
            >
              {/* Swatches stack */}
              <div className="relative h-12 w-16 shrink-0">
                <span
                  className="absolute left-0 top-0 h-12 w-7 rounded-l-xl"
                  style={{ background: c1 }}
                />
                <span
                  className="absolute left-5 top-0 h-12 w-7 rounded-md ring-2 ring-card"
                  style={{ background: c2 }}
                />
                <span
                  className="absolute right-0 top-0 h-12 w-7 rounded-r-xl border border-border"
                  style={{ background: c3 }}
                />
              </div>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-black leading-tight">{meta.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
              </div>

              {/* Active check */}
              {active && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Tu elección se guarda automáticamente y se aplica a toda la app.
      </p>
    </div>
  );
}
