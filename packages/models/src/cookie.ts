import { serialize, parse } from "cookie";

const cookieName = process.env.SESSION_COOKIE || "session";
export const sessionExpiration =
  Number(process.env.SIWE_EXPIRATION_TIME_SECONDS) || 60 * 60 * 24 * 7;
export function serializeSessionCookie(value: string, path: string) {
  return serialize(cookieName, value, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * sessionExpiration),
    path,
  });
}

export function expireSessionCookie(path: string) {
  return serialize(cookieName, "", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    expires: new Date(0),
    path,
  });
}

export function deserializeSessionCookie(cookies?: string): string | null {
  return (cookies && parse(cookies)?.[cookieName]) ?? null;
}

const nextAuthCookieName = "next-auth.session-token";

export function requireAuth(cookieFromHeader?: string): string | null {
  if (!cookieFromHeader) {
    return null;
  }
  const cookies = parse(cookieFromHeader);
  const sessionCookie = Object.keys(cookies).find((c) =>
    c.endsWith(nextAuthCookieName)
  );
  if (!sessionCookie) {
    return null;
  }
  const res = cookies[sessionCookie];
  return res;
}
