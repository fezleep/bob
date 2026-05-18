import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(authCookieName);
  (await cookies()).delete(authCookieName);

  return response;
}
