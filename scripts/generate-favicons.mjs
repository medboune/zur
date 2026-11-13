// Generates favicon assets from public/favicon.svg:
//   favicon.ico (16/32/48), apple-touch-icon.png (180), icon-192.png, icon-512.png
// Run: node scripts/generate-favicons.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svgPath = path.join(root, "public", "favicon.svg");
const outDir = path.join(root, "public");

await mkdir(outDir, { recursive: true });

const targets = [
  { size: 16, file: null },
  { size: 32, file: null },
  { size: 48, file: null },
  { size: 180, file: "apple-touch-icon.png" },
  { size: 192, file: "icon-192.png" },
  { size: 512, file: "icon-512.png" },
];

const buffers = {};
for (const t of targets) {
  const buf = await sharp(svgPath, { density: 300 })
    .resize(t.size, t.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  buffers[t.size] = buf;
  if (t.file) {
    await sharp(buf).toFile(path.join(outDir, t.file));
    console.log(`wrote ${t.file} (${t.size}x${t.size})`);
  }
}

// Multi-size ICO from the 16/32/48 PNGs.
// ICO layout: header + per-image directory entries + PNG data (Vista+ allows PNG payloads).
function pngIco(sizes) {
  const pngs = sizes.map((s) => buffers[s]);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4); // image count

  const dirSize = 16 * pngs.length;
  let offset = 6 + dirSize;
  const entries = [];
  const datas = [];
  sizes.forEach((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s === 256 ? 0 : s, 0); // width
    e.writeUInt8(s === 256 ? 0 : s, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8); // byte size
    e.writeUInt32LE(offset, 12); // data offset
    entries.push(e);
    datas.push(pngs[i]);
    offset += pngs[i].length;
  });
  return Buffer.concat([header, ...entries, ...datas]);
}

await writeFile(path.join(outDir, "favicon.ico"), pngIco([16, 32, 48]));
console.log("wrote favicon.ico (16/32/48)");
