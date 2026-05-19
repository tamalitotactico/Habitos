export type InsightType =
  | "correlation"
  | "prediction"
  | "suggestion"
  | "alert";

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  content: string;
  data: Record<string, unknown>;
  dismissed: boolean;
  createdAt: string;
}
