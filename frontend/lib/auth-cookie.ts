export const authCookieName = "bob_token";

const authCookieDomain = process.env.BOB_AUTH_COOKIE_DOMAIN?.trim();

export const authCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  ...(authCookieDomain ? { domain: authCookieDomain } : {}),
} as const;
