import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInviteToken, hashInviteToken, isAdminAuthorized } from "@/lib/signing-security";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "پایگاه داده پیکربندی نشده است" }, { status: 503 });
  const contracts = await prisma.contract.findMany({ orderBy: { createdAt: "desc" }, include: { signers: { orderBy: { createdAt: "asc" }, select: { id: true, fullName: true, role: true, tokenExpiresAt: true, revokedAt: true, viewedAt: true, signedAt: true } } } });
  return NextResponse.json({ contracts });
}
export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "پایگاه داده پیکربندی نشده است" }, { status: 503 });
  try {
    const input = await request.json(); const title = String(input.title || "").trim(); const body = String(input.body || "").trim();
    const signers = Array.isArray(input.signers) ? input.signers : [];
    if (!title || !body || signers.length < 1) return NextResponse.json({ error: "عنوان، متن قرارداد و حداقل یک امضاکننده لازم است." }, { status: 400 });
    if (signers.some((s: any) => !String(s.fullName || "").trim() || !["متعهد", "متعهدله", "شاهد", "سایر"].includes(s.role))) return NextResponse.json({ error: "نام و نقش معتبر برای تمام امضاکنندگان لازم است." }, { status: 400 });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const issued = signers.map((s: any) => ({ ...s, token: createInviteToken() }));
    const contract = await prisma.contract.create({ data: { title, body, bodyHash: createHash("sha256").update(body, "utf8").digest("hex"), status: "AWAITING_SIGNATURES", signers: { create: issued.map((s: any) => ({ fullName: String(s.fullName).trim(), role: s.role, tokenHash: hashInviteToken(s.token), tokenExpiresAt: expiresAt })) }, events: { create: { type: "CONTRACT_CREATED", metadata: { signerCount: issued.length } } } }, include: { signers: true } });
    return NextResponse.json({ contract: { id: contract.id, title: contract.title, status: contract.status, bodyHash: contract.bodyHash }, links: contract.signers.map((signer, index) => ({ signerId: signer.id, fullName: signer.fullName, role: signer.role, url: `${new URL(request.url).origin}/sign/${issued[index].token}`, expiresAt: expiresAt.toISOString() })) }, { status: 201 });
  } catch (error) { console.error("signing contract creation failed", error); return NextResponse.json({ error: "ایجاد قرارداد انجام نشد. تنظیمات پایگاه داده و کلید رمزنگاری را بررسی کنید." }, { status: 500 }); }
}
