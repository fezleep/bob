"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { login, register, type AuthResponse } from "@/lib/auth";
import { authCookieName, authCookieOptions } from "@/lib/auth-cookie";

export type AuthFormState = {
  fields: {
    name?: string;
    email: string;
  };
  message: string | null;
};

async function setAuthCookie(response: AuthResponse) {
  const maxAge = response.expiresInSeconds;

  (await cookies()).set(authCookieName, response.token, {
    ...authCookieOptions,
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
  });
  revalidatePath("/", "layout");
}

function nextPath(formData: FormData) {
  const value = String(formData.get("next") || "/workspace");

  return value.startsWith("/") && !value.startsWith("//") ? value : "/workspace";
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fields = { email };

  if (!email || !password) {
    return { fields, message: "Email and password are required." };
  }

  try {
    const response = await login({ email, password });
    await setAuthCookie(response);
  } catch (error) {
    return {
      fields,
      message: error instanceof ApiError ? error.message : "Unable to sign in right now.",
    };
  }

  redirect(nextPath(formData));
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fields = { name, email };

  if (!name || !email || !password) {
    return { fields, message: "Name, email and password are required." };
  }

  if (password.length < 8) {
    return { fields, message: "Password must be at least 8 characters." };
  }

  try {
    const response = await register({ name, email, password });
    await setAuthCookie(response);
  } catch (error) {
    return {
      fields,
      message: error instanceof ApiError ? error.message : "Unable to create the user right now.",
    };
  }

  redirect(nextPath(formData));
}
