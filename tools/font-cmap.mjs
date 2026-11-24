/**
 * Writes the characters a source font really has (its cmap) to
 * tests/fonts/<name>-cmap.json, as code point ranges, so that the audits can
 * check site copy against the full font and not only against the subset.
 *
 *   node tools/font-cmap.mjs <font.otf|ttf> <name>
 *   node tools/font-cmap.mjs ../niarim/assets/fonts/Kuramubon.otf Kuramubon
 *
 * Only Unicode subtables are read: platform 0, and platform 3 encodings 1
 * and 10. Platform 1 (Macintosh) subtables map multi-byte legacy codes and
 * would count characters the font does not have.
 */
import fs from "node:fs";
import path from "node:path";

export function readCmap(buffer) {
  const view = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  const tables = view.getUint16(4);
  let cmap = -1;
  for (let i = 0; i < tables; i++) {
    const record = 12 + i * 16;
    const tag = String.fromCharCode(
      ...[0, 1, 2, 3].map((k) => view.getUint8(record + k)),
    );
    if (tag === "cmap") cmap = view.getUint32(record + 8);
  }
  if (cmap < 0) throw Error("no cmap table");
  const points = new Set();
  const count = view.getUint16(cmap + 2);
  for (let i = 0; i < count; i++) {
    const platform = view.getUint16(cmap + 4 + i * 8);
    const encoding = view.getUint16(cmap + 6 + i * 8);
    const unicode =
      platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
    if (!unicode) continue;
    const sub = cmap + view.getUint32(cmap + 8 + i * 8);
    const format = view.getUint16(sub);
    if (format === 4) {
      const segments = view.getUint16(sub + 6) / 2;
      const ends = sub + 14;
      const starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2;
      const offsets = deltas + segments * 2;
      for (let s = 0; s < segments; s++) {
        const end = view.getUint16(ends + s * 2);
        const start = view.getUint16(starts + s * 2);
        const delta = view.getInt16(deltas + s * 2);
        const rangeOffset = view.getUint16(offsets + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let glyph;
          if (rangeOffset === 0) glyph = (c + delta) & 0xffff;
          else {
            const at = offsets + s * 2 + rangeOffset + (c - start) * 2;
            glyph = view.getUint16(at);
            if (glyph) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph) points.add(c);
        }
      }
    } else if (format === 12 || format === 13) {
      const groups = view.getUint32(sub + 12);
      for (let g = 0; g < groups; g++) {
        const at = sub + 16 + g * 12;
        const start = view.getUint32(at);
        const end = view.getUint32(at + 4);
        const first = view.getUint32(at + 8);
        for (let c = start; c <= end; c++)
          if (format === 13 ? first : first + (c - start)) points.add(c);
      }
    }
  }
  return points;
}

export function toRanges(points) {
  const sorted = [...points].sort((a, b) => a - b);
  const ranges = [];
  for (const p of sorted) {
    const last = ranges.at(-1);
    if (last && last[1] === p - 1) last[1] = p;
    else ranges.push([p, p]);
  }
  return ranges;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [file, name] = process.argv.slice(2);
  if (!file || !name) {
    console.error("usage: node tools/font-cmap.mjs <font> <name>");
    process.exit(2);
  }
  const points = readCmap(fs.readFileSync(file));
  const out = path.resolve(
    import.meta.dirname,
    "..",
    "tests",
    "fonts",
    `${name}-cmap.json`,
  );
  fs.writeFileSync(
    out,
    JSON.stringify({
      font: path.basename(file),
      characters: points.size,
      ranges: toRanges(points),
    }) + "\n",
  );
  console.log(`${name}: ${points.size} characters -> ${out}`);
}
