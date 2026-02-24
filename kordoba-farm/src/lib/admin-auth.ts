import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const SALT = process.env.ADMIN_SESSION_SECRET ?? "kordoba-admin-salt";

function getExpectedToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return createHmac("sha256", SALT).update(password).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const expected = getExpectedToken();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(token, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

export async function setAdminCookie(): Promise<string> {
  return getExpectedToken();
}
