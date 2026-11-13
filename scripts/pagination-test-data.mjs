// Adds 6 temporary published listings to exercise pagination (>10 items),
// then they can be removed with --cleanup.
// Run: node scripts/pagination-test-data.mjs [--cleanup]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cleanup = process.argv.includes("--cleanup");

const TEST_ROWS = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1;
  return {
    slug: `pagination-test-item-${n}`,
    reference: `TST-${String(n).padStart(4, "0")}`,
    manufacturer: "PageTest",
    model: `Item-${n}`,
    sector: "SEMICONDUCTOR",
    category: "Pagination test",
    description: `Temporary listing ${n} created to verify server-side pagination with more than ten published items.`,
    conditionKey: "USED_TESTED",
    quantity: 1,
    location: "Testville, OR, USA",
    priceType: "QUOTE",
    specs: "[]",
    searchKey: `pagetestitem${n}`,
    isPublished: true,
    isSample: true,
  };
});

if (cleanup) {
  const r = await prisma.equipment.deleteMany({ where: { reference: { startsWith: "TST-" } } });
  console.log(`removed ${r.count} test listings`);
} else {
  for (const row of TEST_ROWS) {
    await prisma.equipment.upsert({
      where: { reference: row.reference },
      create: row,
      update: row,
    });
  }
  const total = await prisma.equipment.count({ where: { isPublished: true } });
  console.log(`inserted/updated 6 test listings; published total: ${total}`);
}
await prisma.$disconnect();
