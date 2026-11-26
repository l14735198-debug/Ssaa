const { execFileSync } = require("node:child_process");

if (process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL_UNPOOLED) {
    throw new Error("DATABASE_URL_UNPOOLED is required for production migrations");
  }
  execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env: process.env });
} else {
  console.log("Skipping database migrations outside Vercel production.");
}
