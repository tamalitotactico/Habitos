import Link from "next/link";
import { Sprout, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyHabits() {
  return (
    <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-dashed bg-gradient-to-b from-primary/[0.03] to-transparent p-10 text-center">
      {/* Decorative ring */}
      <div className="absolute inset-x-0 top-0 mx-auto h-32 w-32 -translate-y-16 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Sprout className="h-7 w-7 text-primary" />
      </div>

      <div className="relative space-y-1.5 max-w-xs">
        <p className="text-lg font-bold">Tu jardín está vacío</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Los hábitos crecen como las plantas: poco a poco, todos los días.
          Empieza con uno pequeño.
        </p>
      </div>

      <Link
        href="/habits"
        className={cn(buttonVariants({ size: "sm" }), "relative gap-2")}
      >
        Plantar mi primer hábito
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
