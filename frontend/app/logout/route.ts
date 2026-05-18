import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName, authCookieOptions } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(authCookieName, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  (await cookies()).delete(authCookieName);

  return response;
}
