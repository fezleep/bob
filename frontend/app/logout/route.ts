import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { authCookieName, authCookieOptions } from "@/lib/auth-cookie";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(authCookieName, "", {
    ...authCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
  revalidatePath("/", "layout");

  return response;
}
