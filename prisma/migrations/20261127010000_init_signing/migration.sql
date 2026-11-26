CREATE TABLE "Contract" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "bodyHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Signer" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "signedAt" TIMESTAMP(3),
  "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
  "signatureData" TEXT,
  "identityEncrypted" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Signer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SigningEvent" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "signerId" TEXT,
  "type" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SigningEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Signer_tokenHash_key" ON "Signer"("tokenHash");
CREATE INDEX "Signer_contractId_idx" ON "Signer"("contractId");
CREATE INDEX "SigningEvent_contractId_createdAt_idx" ON "SigningEvent"("contractId", "createdAt");
ALTER TABLE "Signer" ADD CONSTRAINT "Signer_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SigningEvent" ADD CONSTRAINT "SigningEvent_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SigningEvent" ADD CONSTRAINT "SigningEvent_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "Signer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
