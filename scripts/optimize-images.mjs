// Recompresses oversized public/images assets in place (same filenames, so
// no DB rows or code references change). Target: <= 1920px wide, JPEG q78.
// Run: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdir, stat, rename } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "public", "images");

const files = (await readdir(dir)).filter((f) => /\.jpe?g$/i.test(f));
let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const full = path.join(dir, file);
  const before = (await stat(full)).size;
  const meta = await sharp(full).metadata();
  const pipeline = sharp(full);
  if (meta.width && meta.width > 1920) {
    pipeline.resize({ width: 1920, withoutEnlargement: true });
  }
  const buf = await pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer();
  if (buf.length < before) {
    // keep a one-time backup so the operation is reversible before commit
    await rename(full, `${full}.orig`);
    await sharp(buf).toFile(full);
    const after = (await stat(full)).size;
    totalBefore += before;
    totalAfter += after;
    console.log(
      `${file}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB` +
        (meta.width ? ` (${meta.width}px wide)` : "")
    );
  } else {
    totalBefore += before;
    totalAfter += before;
    console.log(`${file}: already optimal (${(before / 1024).toFixed(0)}KB)`);
  }
}

console.log(
  `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB ` +
    `(-${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)`
);
