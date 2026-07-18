import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "grader_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function configuredPassword(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || configuredPassword();
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(expiresAt: string, secret: string): string {
  return createHmac("sha256", secret).update(expiresAt).digest("base64url");
}

export function adminPasswordConfigured(): boolean {
  return configuredPassword() !== null;
}

export function verifyAdminPassword(candidate: string): boolean {
  const password = configuredPassword();
  return password ? safeEqual(candidate, password) : false;
}

export function createAdminSession(): { value: string; maxAge: number } {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD가 설정되지 않았습니다.");
  const expiresAt = String(Date.now() + SESSION_SECONDS * 1000);
  return {
    value: `${expiresAt}.${signature(expiresAt, secret)}`,
    maxAge: SESSION_SECONDS,
  };
}

export function verifyAdminSession(value?: string): boolean {
  const secret = sessionSecret();
  if (!secret || !value) return false;
  const [expiresAt, providedSignature] = value.split(".");
  if (!expiresAt || !providedSignature || Number(expiresAt) <= Date.now()) {
    return false;
  }
  return safeEqual(providedSignature, signature(expiresAt, secret));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
}
