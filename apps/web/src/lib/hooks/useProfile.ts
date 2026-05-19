"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileApi } from "@/lib/api/profile";

const PROFILE_KEY = ["profile"] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => profileApi.get().then((r) => r.data.profile),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateDiagnosis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => profileApi.generateDiagnosis().then((r) => r.data.diagnosis),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
    },
    onError: () => toast.error("Error al generar el diagnóstico"),
  });
}
