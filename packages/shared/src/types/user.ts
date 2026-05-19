export interface User {
  id: string;
  email: string;
  name: string;
  onboardedAt: string | null;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  reminderTime?: string;
  weekStartsOn?: 0 | 1;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
