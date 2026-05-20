import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="text-7xl font-extrabold text-muted-foreground/30">404</p>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Volver al inicio
      </Link>
    </div>
  );
}
