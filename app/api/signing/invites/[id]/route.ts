import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createInviteToken, hashInviteToken, isAdminAuthorized } from "@/lib/signing-security";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "پایگاه داده پیکربندی نشده است" }, { status: 503 });
  const { id } = await context.params;
  const signer = await prisma.signer.findUnique({ where: { id } });
  if (!signer) return NextResponse.json({ error: "امضاکننده پیدا نشد" }, { status: 404 });
  if (signer.signedAt) return NextResponse.json({ error: "پس از امضا امکان صدور مجدد لینک وجود ندارد." }, { status: 409 });
  const token = createInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.signer.update({ where: { id }, data: { tokenHash: hashInviteToken(token), tokenExpiresAt: expiresAt, revokedAt: null } }),
    prisma.signingEvent.create({ data: { contractId: signer.contractId, signerId: id, type: "INVITE_REISSUED" } })
  ]);
  return NextResponse.json({ url: `${new URL(request.url).origin}/sign/${token}`, expiresAt: expiresAt.toISOString() });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(request)) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "پایگاه داده پیکربندی نشده است" }, { status: 503 });
  const { id } = await context.params;
  const signer = await prisma.signer.findUnique({ where: { id } });
  if (!signer) return NextResponse.json({ error: "امضاکننده پیدا نشد" }, { status: 404 });
  await prisma.$transaction([
    prisma.signer.update({ where: { id }, data: { revokedAt: new Date() } }),
    prisma.signingEvent.create({ data: { contractId: signer.contractId, signerId: id, type: "INVITE_REVOKED" } })
  ]);
  return NextResponse.json({ ok: true });
}
