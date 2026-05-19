"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { insightsApi } from "@/lib/api/insights";

const INSIGHTS_KEY = ["insights"] as const;

export function useInsights() {
  return useQuery({
    queryKey: INSIGHTS_KEY,
    queryFn: () => insightsApi.getActive().then((r) => r.data.insights),
    staleTime: 60 * 1000,
  });
}

export function useGenerateInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => insightsApi.generate().then((r) => r.data.insights),
    onSuccess: (insights) => {
      qc.setQueryData(INSIGHTS_KEY, insights);
      toast.success(`${insights.length} insight${insights.length !== 1 ? "s" : ""} generados`);
    },
    onError: () => toast.error("Error al generar los insights"),
  });
}

export function useDismissInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => insightsApi.dismiss(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INSIGHTS_KEY });
    },
  });
}
