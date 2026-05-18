import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/workspace", "/pipeline", "/leads"];

export function middleware(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("bob_token")?.value;

  if (token) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/workspace/:path*", "/pipeline/:path*", "/leads/:path*"],
};
