import { createHash, randomBytes, createCipheriv, createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "ssaa_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signSession(timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(timestamp).digest("base64url");
}

export function createAdminSession(secret: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  return `${timestamp}.${signSession(timestamp, secret)}`;
}

export function isAdminAuthorized(request: Request) {
  const secret = process.env.ADMIN_API_KEY;
  if (!secret) return false;
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return false;
  const token = decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1));
  const [timestamp, signature, extra] = token.split(".");
  if (!timestamp || !signature || extra || !/^\d{10}$/.test(timestamp)) return false;
  const issuedAt = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now + 60 || now - issuedAt > SESSION_TTL_SECONDS) return false;
  const expected = Buffer.from(signSession(timestamp, secret));
  const supplied = Buffer.from(signature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export const adminSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
};

/**
 * Encrypt identity data before it reaches persistent storage.
 * DATA_ENCRYPTION_KEY must be a 32-byte key encoded as 64 hex characters.
 */
export function encryptIdentity(value: unknown) {
  const keyHex = process.env.DATA_ENCRYPTION_KEY;
  if (!keyHex || !/^[a-f0-9]{64}$/i.test(keyHex)) {
    throw new Error("DATA_ENCRYPTION_KEY is not configured");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}
