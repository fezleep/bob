export const authCookieName = "bob_token";

export const authCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;
