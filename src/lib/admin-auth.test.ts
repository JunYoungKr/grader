import { afterEach, describe, expect, it } from "vitest";
import {
  createAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "./admin-auth";

const originalPassword = process.env.ADMIN_PASSWORD;
const originalSecret = process.env.ADMIN_SESSION_SECRET;

afterEach(() => {
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
  if (originalSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = originalSecret;
});

describe("admin auth", () => {
  it("accepts only the configured password", () => {
    process.env.ADMIN_PASSWORD = "test-password";
    expect(verifyAdminPassword("test-password")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
  });

  it("creates and verifies a signed session", () => {
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.ADMIN_SESSION_SECRET = "separate-session-secret";
    const session = createAdminSession();
    expect(session.maxAge).toBe(60 * 60 * 8);
    expect(verifyAdminSession(session.value)).toBe(true);
    expect(verifyAdminSession(`${session.value}tampered`)).toBe(false);
  });

  it("rejects expired sessions", () => {
    process.env.ADMIN_PASSWORD = "test-password";
    expect(verifyAdminSession("1.invalid-signature")).toBe(false);
  });
});
