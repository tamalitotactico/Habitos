import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SproutMascot } from "@/components/SproutMascot";
import { cn } from "@/lib/utils";

export function EmptyHabits() {
  return (
    <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] border-2 border-dashed border-primary/30 bg-gradient-to-b from-primary/[0.06] via-card to-accent/[0.05] p-8 text-center">
      {/* Glow background */}
      <div className="absolute inset-x-0 top-0 mx-auto h-40 w-40 -translate-y-20 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative h-24 w-24">
        <SproutMascot streak={0} />
      </div>

      <div className="relative max-w-xs space-y-1.5">
        <p className="font-display text-xl font-black">Tu jardín está vacío</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Los hábitos crecen como las plantas: poco a poco, todos los días. Empieza con uno pequeño.
        </p>
      </div>

      <Link
        href="/habits"
        className={cn(buttonVariants({ size: "lg" }), "relative gap-2")}
      >
        Plantar mi primer hábito
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
