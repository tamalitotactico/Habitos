import { api } from "./client";

export type InsightType = "alert" | "correlation" | "prediction" | "suggestion";

export interface Insight {
  id: string;
  type: InsightType;
  content: string;
  data: string;
  dismissed: boolean;
  createdAt: string;
}

export const insightsApi = {
  getActive: () => api.get<{ insights: Insight[] }>("/insights"),
  generate: () => api.post<{ insights: Insight[] }>("/insights/generate"),
  dismiss: (id: string) => api.patch(`/insights/${id}/dismiss`),
};
