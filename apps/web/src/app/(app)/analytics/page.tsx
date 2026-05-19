"use client";

import { AlertTriangle, TrendingDown, Calendar, Lightbulb, RefreshCw, X, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights, useGenerateInsights, useDismissInsight } from "@/lib/hooks/useInsights";
import { InsightType } from "@/lib/api/insights";

const TYPE_CONFIG: Record<
  InsightType,
  { icon: React.ElementType; color: string; label: string }
> = {
  alert: {
    icon: AlertTriangle,
    color: "text-destructive",
    label: "Alerta",
  },
  correlation: {
    icon: TrendingDown,
    color: "text-blue-500",
    label: "Correlación",
  },
  prediction: {
    icon: Calendar,
    color: "text-purple-500",
    label: "Predicción",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-amber-500",
    label: "Sugerencia",
  },
};

const TYPE_ORDER: InsightType[] = ["alert", "correlation", "prediction", "suggestion"];

function InsightCard({
  id,
  type,
  content,
}: {
  id: string;
  type: InsightType;
  content: string;
}) {
  const dismiss = useDismissInsight();
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;

  return (
    <Card className="flex items-start gap-3 px-4 py-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.color}`} />
      <div className="min-w-0 flex-1">
        <p className={`mb-0.5 text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => dismiss.mutate(id)}
        disabled={dismiss.isPending}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: insights, isLoading } = useInsights();
  const generate = useGenerateInsights();

  const sorted = [...(insights ?? [])].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análisis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patrones y sugerencias basados en tus datos
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
        >
          <RefreshCw className={`h-4 w-4 ${generate.isPending ? "animate-spin" : ""}`} />
          {generate.isPending ? "Analizando…" : "Actualizar"}
        </Button>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <BarChart2 className="h-12 w-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="font-medium">Sin insights aún</p>
              <p className="text-sm text-muted-foreground">
                Necesitas al menos una semana de datos. Pulsa "Actualizar" para analizar.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${generate.isPending ? "animate-spin" : ""}`} />
              Generar análisis
            </Button>
          </div>
        ) : (
          sorted.map((insight) => (
            <InsightCard
              key={insight.id}
              id={insight.id}
              type={insight.type}
              content={insight.content}
            />
          ))
        )}
      </div>

      {/* Legend */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tipos de insight
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.entries(TYPE_CONFIG) as [InsightType, (typeof TYPE_CONFIG)[InsightType]][]).map(
              ([type, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
                  >
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
