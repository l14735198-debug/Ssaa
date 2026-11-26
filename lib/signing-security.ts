import { createHash, randomBytes, createCipheriv } from "node:crypto";

export function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isAdminAuthorized(request: Request) {
  const configured = process.env.ADMIN_API_KEY;
  const supplied = request.headers.get("x-admin-key");
  return Boolean(configured && supplied && supplied === configured);
}

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
