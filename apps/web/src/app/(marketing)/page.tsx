import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Habit App</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Construye hábitos duraderos. Entiende por qué los abandonas.
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className={cn(buttonVariants())}>
          Empezar gratis
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
