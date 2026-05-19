import { api } from "./client";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  onboardedAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export const authApi = {
  register(data: { email: string; password: string; name: string }) {
    return api.post<AuthResponse>("/auth/register", data);
  },

  login(data: { email: string; password: string }) {
    return api.post<AuthResponse>("/auth/login", data);
  },

  refresh() {
    return api.post<AuthResponse>("/auth/refresh");
  },

  logout() {
    return api.post("/auth/logout");
  },

  me() {
    return api.get<{ user: PublicUser }>("/auth/me");
  },
};
