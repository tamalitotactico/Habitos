import Link from "next/link";
import { CheckCircle2, Timer, Sparkles, ArrowRight, TrendingUp, Calendar, Lightbulb } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construye hábitos que duran",
};

const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Hábitos diarios",
    description:
      "Crea hábitos buenos y elimina los malos. Rastrea rachas, mira tu progreso del día y mantén el momentum.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Timer,
    title: "Control de tiempo",
    description:
      "Usa el temporizador integrado o agrega sesiones manualmente. Ve en qué categorías va tu tiempo cada día.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Sparkles,
    title: "Insights con IA",
    description:
      "Descubre correlaciones entre tu tiempo y tus hábitos. La app detecta patrones y te avisa cuando te desvías.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Crea tus hábitos",
    description: "Define lo que quieres construir y lo que quieres eliminar. Sin límites.",
    icon: CheckCircle2,
  },
  {
    number: "02",
    title: "Registra tu tiempo",
    description: "Usa el temporizador o agrega sesiones manualmente. Cada minuto cuenta.",
    icon: Calendar,
  },
  {
    number: "03",
    title: "Descubre patrones",
    description: "La app analiza tus datos y te muestra qué está funcionando y qué no.",
    icon: TrendingUp,
  },
];

const INSIGHTS_PREVIEW = [
  {
    icon: Lightbulb,
    color: "text-amber-500",
    text: "Los martes son tu mejor día para completar hábitos (92% de cumplimiento).",
  },
  {
    icon: TrendingUp,
    color: "text-blue-500",
    text: "Los días que trabajas más de 6h completas el 40% menos de tus hábitos.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto max-w-5xl px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Análisis con IA incluido
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Construye hábitos{" "}
            <span className="text-primary">que duran.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Registra hábitos, controla tu tiempo y descubre los patrones que te frenan.
            Todo en un solo lugar, con insights que realmente importan.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Ya tengo cuenta
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Sin tarjeta de crédito · Sin límite de hábitos
          </p>
        </div>
      </section>

      {/* Insights preview */}
      <section className="border-y bg-muted/30 py-10">
        <div className="container mx-auto max-w-2xl px-4 space-y-3">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            Ejemplo de insights generados por la app
          </p>
          {INSIGHTS_PREVIEW.map(({ icon: Icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="mb-12 text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Todo lo que necesitas</h2>
          <p className="text-muted-foreground">
            Tres pilares para entender y mejorar tus hábitos.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 space-y-4">
              <div className={cn("inline-flex rounded-xl p-3", bg)}>
                <Icon className={cn("h-6 w-6", color)} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/20 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Cómo funciona</h2>
            <p className="text-muted-foreground">En tres pasos simples.</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map(({ number, title, description, icon: Icon }) => (
              <div key={number} className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {number}
                </span>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto max-w-5xl px-4 py-24 text-center">
        <div className="mx-auto max-w-xl space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            ¿Listo para cambiar tus hábitos?
          </h2>
          <p className="text-muted-foreground">
            Empieza hoy. El mejor momento para construir un buen hábito fue ayer;
            el segundo mejor momento es ahora.
          </p>
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
            Crear mi cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
