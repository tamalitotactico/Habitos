"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Timer, BarChart2, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Hoy", icon: LayoutDashboard },
  { href: "/habits", label: "Hábitos", icon: ListChecks },
  { href: "/tracking", label: "Tiempo", icon: Timer },
  { href: "/analytics", label: "Análisis", icon: BarChart2 },
  { href: "/profile", label: "Perfil", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-card px-3 py-6">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold tracking-tight">Habit App</span>
      </div>

      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground"
        onClick={clearAuth}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>
    </aside>
  );
}
