import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName, authCookieOptions } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(authCookieName, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  (await cookies()).delete(authCookieName);
  revalidatePath("/", "layout");

  return response;
}
