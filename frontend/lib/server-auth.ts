import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { authCookieName } from "@/lib/auth-cookie";

export { authCookieName };

export async function getAuthToken() {
  return (await cookies()).get(authCookieName)?.value ?? null;
}

export async function requireAuthToken() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  return token;
}

export async function getServerUser() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    return await getCurrentUser(token);
  } catch {
    return null;
  }
}

export function isInvalidAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function isTemporaryAuthValidationError(error: unknown) {
  return error instanceof ApiError && !isInvalidAuthError(error);
}

export function redirectToLogin() {
  redirect("/login");
}
