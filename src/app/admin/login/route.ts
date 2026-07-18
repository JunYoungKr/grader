import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), 303);
  }

  const session = createAdminSession();
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: session.maxAge,
  });
  return response;
}
