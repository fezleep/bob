import { apiFetch } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "USER";
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: AuthUser;
};

export async function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function register(input: { name: string; email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(authToken?: string) {
  return apiFetch<AuthUser>("/api/auth/me", { authToken });
}
