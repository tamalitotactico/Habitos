import { api } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  onboardedAt: string | null;
  goals: string[];
  availableMinutesPerDay: number;
  diagnosis: string | null;
}

export interface OnboardingDto {
  goals: string[];
  availableMinutesPerDay: number;
}

export const profileApi = {
  get: () => api.get<{ profile: UserProfile }>("/profile"),
  generateDiagnosis: () => api.post<{ diagnosis: string }>("/profile/diagnosis/generate"),
};
