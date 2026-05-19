"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth.store";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
      const dest = data.user.onboardedAt ? "/dashboard" : "/onboarding";
      router.push(dest);
    },
    onError: (err: unknown) => {
      const msg = extractMessage(err) ?? "Credenciales incorrectas";
      toast.error(msg);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
      router.push("/onboarding");
    },
    onError: (err: unknown) => {
      const msg = extractMessage(err) ?? "Error al crear la cuenta";
      toast.error(msg);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      router.push("/login");
    },
  });
}

function extractMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { data?: { error?: string } } }).response;
    return res?.data?.error ?? null;
  }
  return null;
}
