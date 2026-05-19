"use client";

import { Sparkles, Clock, Target, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useGenerateDiagnosis } from "@/lib/hooks/useProfile";
import { useAuthStore } from "@/stores/auth.store";

const GOAL_LABELS: Record<string, string> = {
  habits: "Mejorar hábitos",
  time: "Gestión del tiempo",
  productivity: "Productividad",
  screen: "Reducir pantalla",
  health: "Salud y bienestar",
};

function formatMinutes(min: number) {
  if (min >= 60) return `${min / 60}h`;
  return `${min} min`;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useProfile();
  const generate = useGenerateDiagnosis();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu configuración y diagnóstico personalizado
        </p>
      </div>

      {/* User info */}
      <Card className="p-5 space-y-1">
        <p className="font-semibold text-lg">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Goals & time */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Tus metas
            </h2>
            <Card className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.goals ?? []).length > 0 ? (
                    (profile?.goals ?? []).map((g) => (
                      <Badge key={g} variant="secondary">
                        {GOAL_LABELS[g] ?? g}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin metas configuradas</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">
                    {formatMinutes(profile?.availableMinutesPerDay ?? 30)}
                  </span>{" "}
                  disponibles al día
                </span>
              </div>
            </Card>
          </div>

          {/* Diagnosis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Diagnóstico
              </h2>
              {/* TODO: Enable when Claude API is integrated (Sprint 5) */}
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                IA Próximamente
              </Badge>
            </div>

            <Card className="p-5 space-y-4">
              {profile?.diagnosis ? (
                <>
                  <p className="text-sm leading-relaxed">{profile.diagnosis}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => generate.mutate()}
                    disabled={generate.isPending}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${generate.isPending ? "animate-spin" : ""}`} />
                    Regenerar
                  </Button>
                </>
              ) : (
                <div className="space-y-3 text-center py-2">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Genera tu diagnóstico personalizado basado en tus metas.
                  </p>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => generate.mutate()}
                    disabled={generate.isPending}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {generate.isPending ? "Generando…" : "Generar diagnóstico"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
