import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
