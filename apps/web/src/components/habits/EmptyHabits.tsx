import Link from "next/link";
import { Sprout } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyHabits() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Sprout className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Aún no tienes hábitos</p>
        <p className="text-sm text-muted-foreground">
          Crea tu primer hábito y empieza a construir tu rutina.
        </p>
      </div>
      <Link href="/habits" className={cn(buttonVariants({ size: "sm" }))}>
        Crear hábito
      </Link>
    </div>
  );
}
