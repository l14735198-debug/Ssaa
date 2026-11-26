import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptIdentity, hashInviteToken } from "@/lib/signing-security";
export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "سامانه امضا هنوز پیکربندی نشده است." }, { status: 503 });
  const { token } = await context.params;
  const signer = await prisma.signer.findUnique({ where: { tokenHash: hashInviteToken(token) }, include: { contract: { select: { title: true, body: true, bodyHash: true } } } });
  if (!signer || signer.revokedAt || signer.tokenExpiresAt < new Date()) return NextResponse.json({ error: "این لینک نامعتبر، لغوشده یا منقضی شده است." }, { status: 404 });
  if (signer.signedAt) return NextResponse.json({ error: "این قرارداد قبلاً توسط شما امضا شده است." }, { status: 409 });
  if (!signer.viewedAt) await prisma.$transaction([prisma.signer.update({ where: { id: signer.id }, data: { viewedAt: new Date() } }), prisma.signingEvent.create({ data: { contractId: signer.contractId, signerId: signer.id, type: "INVITE_VIEWED" } })]);
  return NextResponse.json({ signer: { fullName: signer.fullName, role: signer.role }, contract: signer.contract });
}
export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "سامانه امضا هنوز پیکربندی نشده است." }, { status: 503 });
  const { token } = await context.params;
  const signer = await prisma.signer.findUnique({ where: { tokenHash: hashInviteToken(token) } });
  if (!signer || signer.revokedAt || signer.tokenExpiresAt < new Date()) return NextResponse.json({ error: "این لینک نامعتبر، لغوشده یا منقضی شده است." }, { status: 404 });
  if (signer.signedAt) return NextResponse.json({ error: "امضا قبلاً ثبت شده است." }, { status: 409 });
  const input = await request.json(); const nationalId = String(input.nationalId || "").trim(); const birthDate = String(input.birthDate || "").trim(); const signature = String(input.signature || "");
  if (input.accepted !== true || !/^\d{10}$/.test(nationalId) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !signature.startsWith("data:image/png;base64,") || signature.length > 180000) return NextResponse.json({ error: "کد ملی، تاریخ تولد، پذیرش مفاد و امضای ترسیمی معتبر الزامی است." }, { status: 400 });
  const signedAt = new Date();
  const saved = await prisma.signer.updateMany({ where: { id: signer.id, signedAt: null, revokedAt: null, tokenExpiresAt: { gt: signedAt } }, data: { acceptedTerms: true, signatureData: signature, identityEncrypted: encryptIdentity({ nationalId, birthDate }), signedAt } });
  if (saved.count !== 1) return NextResponse.json({ error: "وضعیت لینک تغییر کرده است؛ صفحه را دوباره بارگذاری کنید." }, { status: 409 });
  await prisma.signingEvent.create({ data: { contractId: signer.contractId, signerId: signer.id, type: "SIGNATURE_RECORDED", metadata: { method: "DRAWN_SIGNATURE" } } });
  return NextResponse.json({ ok: true, signedAt: signedAt.toISOString(), note: "امضای ترسیمی ثبت شد؛ این مورد به‌تنهایی احراز هویت یا اثر انگشت زیستی محسوب نمی‌شود." });
}
