import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSession, adminSessionCookie, isSameOriginRequest } from "@/lib/signing-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  const configured = process.env.ADMIN_API_KEY;
  if (!configured) return NextResponse.json({ error: "کلید مدیر در سرور تنظیم نشده است." }, { status: 503 });
  const input = await request.json().catch(() => ({}));
  const supplied = typeof input.key === "string" ? input.key : "";
  const expectedBytes = Buffer.from(configured);
  const suppliedBytes = Buffer.from(supplied);
  if (expectedBytes.length !== suppliedBytes.length || suppliedBytes.length > 256 || !timingSafeEqual(expectedBytes, suppliedBytes)) {
    return NextResponse.json({ error: "کلید دسترسی نادرست است." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie.name, createAdminSession(configured), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: adminSessionCookie.maxAge,
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminSessionCookie.name, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: 0,
  });
  return response;
}
