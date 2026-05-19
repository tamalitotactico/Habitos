"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api/client";
import { useMutation } from "@tanstack/react-query";

const GOALS = [
  { id: "habits", label: "Mejorar mis hábitos" },
  { id: "time", label: "Gestionar mejor mi tiempo" },
  { id: "productivity", label: "Ser más productivo/a" },
  { id: "screen", label: "Reducir tiempo en pantalla" },
  { id: "health", label: "Mejorar mi salud y bienestar" },
];

const TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h 30 min" },
  { value: 120, label: "2h o más" },
];

const GOAL_LABELS: Record<string, string> = Object.fromEntries(
  GOALS.map((g) => [g.id, g.label])
);

export default function OnboardingPage() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [minutes, setMinutes] = useState<number>(30);

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

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step 1 — Metas */}
      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paso 1 de 3
            </p>
            <h1 className="text-xl font-bold">¿Cuáles son tus metas?</h1>
            <p className="text-sm text-muted-foreground">
              Elige al menos una. Esto nos ayuda a personalizar tu experiencia.
            </p>
          </div>

          <div className="space-y-2">
            {GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  )}
                >
                  {goal.label}
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={selectedGoals.length === 0}
            onClick={() => setStep(2)}
          >
            Siguiente
          </Button>
        </Card>
      )}

      {/* Step 2 — Tiempo disponible */}
      {step === 2 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paso 2 de 3
            </p>
            <h1 className="text-xl font-bold">¿Cuánto tiempo tienes al día?</h1>
            <p className="text-sm text-muted-foreground">
              Tiempo que puedes dedicar a mejorar tus hábitos.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMinutes(opt.value)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                  minutes === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-foreground hover:bg-accent"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Siguiente
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Confirmación */}
      {step === 3 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Paso 3 de 3
            </p>
            <h1 className="text-xl font-bold">
              Todo listo{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Confirma tu perfil y empieza a mejorar.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Tus metas</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGoals.map((g) => (
                  <Badge key={g} variant="secondary">
                    {GOAL_LABELS[g]}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Tiempo disponible al día
              </p>
              <p className="text-sm font-medium">
                {TIME_OPTIONS.find((o) => o.value === minutes)?.label}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              className="flex-1"
              onClick={() => finish.mutate()}
              disabled={finish.isPending}
            >
              {finish.isPending ? "Guardando…" : "Comenzar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
