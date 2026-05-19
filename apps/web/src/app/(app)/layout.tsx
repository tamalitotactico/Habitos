"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (!user.onboardedAt) router.replace("/onboarding");
  }, [user, router]);

  if (!user || !user.onboardedAt) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — visible en desktop */}
      <AppSidebar />

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="container mx-auto max-w-4xl px-4 py-6">{children}</div>
      </main>

      {/* Bottom nav — visible en móvil */}
      <BottomNav />
    </div>
  );
}
