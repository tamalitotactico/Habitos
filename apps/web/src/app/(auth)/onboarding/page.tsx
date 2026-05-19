"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { user, setAuth } = useAuthStore();
  const router = useRouter();

  const finish = useMutation({
    mutationFn: () => api.post<{ user: typeof user }>("/auth/onboard"),
    onSuccess: ({ data }) => {
      if (data.user && user) {
        setAuth(
          { ...user, onboardedAt: new Date().toISOString() },
          localStorage.getItem("accessToken") ?? ""
        );
      }
      router.push("/dashboard");
    },
    onError: () => {
      // Onboarding endpoint arrives in Sprint 5 — skip for now
      router.push("/dashboard");
    },
  });

  return (
    <Card className="p-6 space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          Bienvenido{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Tu cuenta está lista. El diagnóstico personalizado llegará en breve.
        </p>
      </div>

      <Button
        className="w-full"
        onClick={() => finish.mutate()}
        disabled={finish.isPending}
      >
        Ir al dashboard
      </Button>
    </Card>
  );
}
