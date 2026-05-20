"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Target, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api/client";
import { useMutation } from "@tanstack/react-query";

const GOALS = [
  { id: "habits",       label: "Mejorar mis hábitos",         emoji: "🌱" },
  { id: "time",         label: "Gestionar mejor mi tiempo",   emoji: "⏰" },
  { id: "productivity", label: "Ser más productivo/a",        emoji: "🎯" },
  { id: "screen",       label: "Reducir tiempo en pantalla",  emoji: "📵" },
  { id: "health",       label: "Mejorar mi salud y bienestar", emoji: "🌿" },
];

const TIME_OPTIONS = [
  { value: 15,  label: "15 min", hint: "Empezar suave" },
  { value: 30,  label: "30 min", hint: "Lo más común" },
  { value: 45,  label: "45 min", hint: "" },
  { value: 60,  label: "1 hora", hint: "Comprometido" },
  { value: 90,  label: "1h 30m", hint: "" },
  { value: 120, label: "2h+",    hint: "Intensivo" },
];

const GOAL_LABELS = Object.fromEntries(GOALS.map((g) => [g.id, g.label]));

export default function OnboardingPage() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<number>(30);
  const [animKey, setAnimKey] = useState(0);

  // Re-trigger entrance animation on step change
  useEffect(() => { setAnimKey((k) => k + 1); }, [step]);

  const finish = useMutation({
    mutationFn: () =>
      api.post<{ user: typeof user }>("/auth/onboard", {
        goals: selectedGoals,
        availableMinutesPerDay: minutes,
      }),
    onSuccess: ({ data }) => {
      if (data.user && user) {
        setAuth(
          { ...user, onboardedAt: data.user?.onboardedAt ?? new Date().toISOString() },
          localStorage.getItem("accessToken") ?? ""
        );
      }
      router.push("/dashboard");
    },
  });

  function toggleGoal(id: string) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function goTo(s: 1 | 2 | 3) { setStep(s); }

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              s < step  && "bg-primary/60",
              s === step && "bg-primary",
              s > step  && "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1 — Goals */}
      {step === 1 && (
        <Card key={`s1-${animKey}`} className="p-6 space-y-5 animate-slide-up-fade">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Paso 1 de 3
              </p>
              <h1 className="text-xl font-bold leading-tight">
                Cuéntame, ¿qué quieres mejorar?
              </h1>
              <p className="text-sm text-muted-foreground">
                Elige una o varias. No hay respuestas incorrectas.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary/5 text-primary scale-[1.01]"
                      : "border-border bg-card hover:bg-muted active:scale-[0.99]"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg leading-none">{goal.emoji}</span>
                    {goal.label}
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={selectedGoals.length === 0}
            onClick={() => goTo(2)}
          >
            Continuar
          </Button>
        </Card>
      )}

      {/* Step 2 — Time */}
      {step === 2 && (
        <Card key={`s2-${animKey}`} className="p-6 space-y-5 animate-slide-up-fade">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Paso 2 de 3
              </p>
              <h1 className="text-xl font-bold leading-tight">
                ¿Cuánto tiempo puedes darte al día?
              </h1>
              <p className="text-sm text-muted-foreground">
                Sé honesto. Mejor poco constante que mucho un solo día.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map((opt) => {
              const active = minutes === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setMinutes(opt.value)}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                    active
                      ? "border-primary bg-primary/5 text-primary scale-[1.02]"
                      : "border-border bg-card hover:bg-muted active:scale-[0.98]"
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.hint && (
                    <span className="text-[10px] font-normal text-muted-foreground">{opt.hint}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => goTo(1)}>
              Atrás
            </Button>
            <Button className="flex-1" onClick={() => goTo(3)}>
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Confirmation */}
      {step === 3 && (
        <Card key={`s3-${animKey}`} className="p-6 space-y-5 animate-slide-up-fade">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Paso 3 de 3
              </p>
              <h1 className="text-xl font-bold leading-tight">
                Listo{user?.name ? `, ${user.name}` : ""}. Esto es lo que tenemos.
              </h1>
              <p className="text-sm text-muted-foreground">
                Podrás cambiarlo cuando quieras desde tu perfil.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tus metas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGoals.map((g) => {
                  const goal = GOALS.find((x) => x.id === g);
                  return (
                    <Badge key={g} variant="secondary" className="gap-1">
                      <span>{goal?.emoji}</span>
                      {GOAL_LABELS[g]}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Tu tiempo diario
              </p>
              <p className="text-sm font-semibold">
                {TIME_OPTIONS.find((o) => o.value === minutes)?.label}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => goTo(2)}>
              Atrás
            </Button>
            <Button
              className="flex-1"
              onClick={() => finish.mutate()}
              disabled={finish.isPending}
            >
              {finish.isPending ? "Preparando…" : "Empezar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
