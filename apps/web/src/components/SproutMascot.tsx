"use client";

import { cn } from "@/lib/utils";

interface Props {
  streak: number;
  className?: string;
  animated?: boolean;
}

/**
 * Brote-mascota que crece según la racha del usuario.
 * Etapas: seed (0) → sprout (1–3) → small (4–9) → medium (10–29) → flowering (30+)
 */
export function SproutMascot({ streak, className, animated = true }: Props) {
  const stage =
    streak === 0 ? 0 :
    streak < 4  ? 1 :
    streak < 10 ? 2 :
    streak < 30 ? 3 : 4;

  return (
    <div className={cn("relative", animated && "animate-sprout-grow", className)}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        {/* Pot — base común en todas las etapas */}
        <Pot />

        {/* Plant by stage */}
        <g
          className={cn(animated && stage > 0 && "animate-sprout-sway")}
          style={{ transformOrigin: "60px 80px" }}
        >
          {stage === 0 && <Seed />}
          {stage === 1 && <Sprout />}
          {stage === 2 && <SmallPlant />}
          {stage === 3 && <MediumPlant />}
          {stage === 4 && <FloweringPlant />}
        </g>

        {/* Eyes — once it has leaves */}
        {stage >= 1 && <Eyes stage={stage} />}
      </svg>
    </div>
  );
}

function Pot() {
  return (
    <g>
      {/* Pot body */}
      <path
        d="M 36 84 L 40 108 Q 40 112 44 112 L 76 112 Q 80 112 80 108 L 84 84 Z"
        fill="oklch(0.62 0.10 50)"
      />
      {/* Pot rim */}
      <rect x="32" y="80" width="56" height="8" rx="2" fill="oklch(0.55 0.10 50)" />
      {/* Soil (top of pot) */}
      <ellipse cx="60" cy="83" rx="26" ry="2.5" fill="oklch(0.32 0.05 50)" />
    </g>
  );
}

function Seed() {
  return (
    <g>
      <ellipse cx="60" cy="82" rx="4" ry="2.5" fill="oklch(0.35 0.06 50)" />
    </g>
  );
}

function Sprout() {
  return (
    <g>
      {/* Stem */}
      <path d="M 60 82 Q 60 72 60 64" stroke="oklch(0.52 0.115 152)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Two tiny leaves */}
      <ellipse cx="54" cy="68" rx="6" ry="4" transform="rotate(-25 54 68)" fill="oklch(0.55 0.13 145)" />
      <ellipse cx="66" cy="68" rx="6" ry="4" transform="rotate(25 66 68)"  fill="oklch(0.55 0.13 145)" />
    </g>
  );
}

function SmallPlant() {
  return (
    <g>
      <path d="M 60 82 Q 60 68 60 52" stroke="oklch(0.42 0.10 152)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* 4 leaves */}
      <ellipse cx="50" cy="64" rx="9" ry="5" transform="rotate(-30 50 64)" fill="oklch(0.55 0.13 145)" />
      <ellipse cx="70" cy="64" rx="9" ry="5" transform="rotate(30 70 64)"  fill="oklch(0.55 0.13 145)" />
      <ellipse cx="52" cy="52" rx="8" ry="4.5" transform="rotate(-25 52 52)" fill="oklch(0.58 0.135 148)" />
      <ellipse cx="68" cy="52" rx="8" ry="4.5" transform="rotate(25 68 52)"  fill="oklch(0.58 0.135 148)" />
    </g>
  );
}

function MediumPlant() {
  return (
    <g>
      <path d="M 60 82 Q 58 60 60 38" stroke="oklch(0.40 0.10 152)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Lower leaves */}
      <ellipse cx="46" cy="68" rx="12" ry="6"  transform="rotate(-30 46 68)" fill="oklch(0.50 0.13 145)" />
      <ellipse cx="74" cy="68" rx="12" ry="6"  transform="rotate(30 74 68)"  fill="oklch(0.50 0.13 145)" />
      {/* Mid */}
      <ellipse cx="48" cy="54" rx="11" ry="5.5" transform="rotate(-30 48 54)" fill="oklch(0.55 0.13 145)" />
      <ellipse cx="72" cy="54" rx="11" ry="5.5" transform="rotate(30 72 54)"  fill="oklch(0.55 0.13 145)" />
      {/* Top */}
      <ellipse cx="54" cy="42" rx="9"  ry="5"   transform="rotate(-25 54 42)" fill="oklch(0.60 0.14 148)" />
      <ellipse cx="66" cy="42" rx="9"  ry="5"   transform="rotate(25 66 42)"  fill="oklch(0.60 0.14 148)" />
    </g>
  );
}

function FloweringPlant() {
  return (
    <g>
      <path d="M 60 82 Q 58 58 60 30" stroke="oklch(0.38 0.10 152)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="42" cy="68" rx="14" ry="7"   transform="rotate(-30 42 68)" fill="oklch(0.48 0.12 145)" />
      <ellipse cx="78" cy="68" rx="14" ry="7"   transform="rotate(30 78 68)"  fill="oklch(0.48 0.12 145)" />
      <ellipse cx="46" cy="52" rx="12" ry="6"   transform="rotate(-30 46 52)" fill="oklch(0.53 0.13 145)" />
      <ellipse cx="74" cy="52" rx="12" ry="6"   transform="rotate(30 74 52)"  fill="oklch(0.53 0.13 145)" />
      <ellipse cx="52" cy="38" rx="9"  ry="5"   transform="rotate(-25 52 38)" fill="oklch(0.58 0.135 148)" />
      <ellipse cx="68" cy="38" rx="9"  ry="5"   transform="rotate(25 68 38)"  fill="oklch(0.58 0.135 148)" />
      {/* Flower */}
      <g>
        <circle cx="50" cy="24" r="4.5" fill="oklch(0.78 0.155 70)" />
        <circle cx="70" cy="24" r="4.5" fill="oklch(0.78 0.155 70)" />
        <circle cx="60" cy="16" r="5"   fill="oklch(0.82 0.165 75)" />
        <circle cx="60" cy="30" r="5"   fill="oklch(0.78 0.155 70)" />
        <circle cx="60" cy="23" r="3"   fill="oklch(0.55 0.12 60)" />
      </g>
    </g>
  );
}

function Eyes({ stage }: { stage: number }) {
  // Eyes positioned roughly on the upper plant, adjusted per stage
  const cy = stage === 1 ? 68 : stage === 2 ? 58 : stage === 3 ? 48 : 38;
  const x1 = stage === 1 ? 56 : 54;
  const x2 = stage === 1 ? 64 : 66;
  const r = stage === 1 ? 1 : 1.4;

  return (
    <g>
      <circle cx={x1} cy={cy} r={r} fill="oklch(0.18 0.02 145)" />
      <circle cx={x2} cy={cy} r={r} fill="oklch(0.18 0.02 145)" />
    </g>
  );
}
