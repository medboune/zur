// Apply scripts/seed-d1.sql to the local SQLite dev database.
// (The file targets Cloudflare D1, but D1 is SQLite-compatible, so the
//  same SQL runs locally — keeping preview and production seeds identical.)
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const sql = readFileSync(new URL("./seed-d1.sql", import.meta.url), "utf8");
const prisma = new PrismaClient();

try {
  // Split on semicolons that end a statement (the file has no strings with ';'
  // beyond escaped ones — safe here because each INSERT is a single statement).
  const statements = sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  for (const stmt of statements) {
    // Skip statement chunks that are only comments.
    const body = stmt
      .split("\n")
      .filter((l) => !l.trim().startsWith("--"))
      .join("\n")
      .trim();
    if (!body) continue;
    await prisma.$executeRawUnsafe(body);
  }
  const count = await prisma.equipment.count({ where: { isSample: true } });
  const total = await prisma.equipment.count();
  console.log(`Seeded OK — sample listings: ${count}, total equipment: ${total}`);
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
