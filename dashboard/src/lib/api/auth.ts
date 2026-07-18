import { api } from "./client";
import type { User } from "./dto";

export type LoginResponse = { token?: string; user: User };

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>("/api/auth/login", { username, password }),

  onboardSuperAdmin: (data: {
    username: string;
    email: string;
    password: string;
  }) => api.post<LoginResponse>("/api/auth/onboard-super-admin", data),

  register: (data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) => api.post<User>("/api/auth/register", data),

  logout: () => api.post<unknown>("/api/auth/logout"),

  profile: () => api.get<User>("/api/auth/profile"),
};
