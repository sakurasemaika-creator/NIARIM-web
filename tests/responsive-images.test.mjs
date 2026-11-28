// The wide screens of the top page come in smaller copies (srcset) so a
// screen that needs fewer pixels downloads fewer bytes. Every language has the
// same copies, each copy is the picture at that width (same aspect ratio), the
// largest one is the original file, and the Japanese HTML and the dictionary
// list the same files.
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const publicDir = new URL("../public/", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, publicDir), "utf8");
const langs = ["ja", "en", "es", "fr", "ko", "zh-Hans", "zh-Hant"];
const images = {
  "timeline-speech-timestamps": [1024, 1536, 2048, 2560],
  "save-slots": [360, 720, 1080],
  "save-tree-branches": [360, 720, 1080],
};

function dictionary() {
  const window = {};
  runInNewContext(read("js/i18n-dict-showcase.js"), { window });
  return window.NIARIM_I18N_DICT;
}

// Width and height of a lossy WebP (a plain VP8 key frame).
function webpSize(url) {
  const file = fs.readFileSync(url);
  assert.equal(file.subarray(0, 4).toString("latin1"), "RIFF");
  assert.equal(file.subarray(8, 16).toString("latin1"), "WEBPVP8 ");
  assert.equal(file.subarray(23, 26).toString("hex"), "9d012a");
  return [file.readUInt16LE(26) & 0x3fff, file.readUInt16LE(28) & 0x3fff];
}

function candidates(srcset) {
  return srcset
    .trim()
    .split(/\s*,\s*/)
    .map((entry) => {
      const [url, width] = entry.split(/\s+/);
      assert.match(width, /^\d+w$/, entry);
      return { url, width: Number(width.slice(0, -1)) };
    });
}

test("every language has each copy, at its width and the original's shape", () => {
  const dict = dictionary();
  for (const lang of langs) {
    for (const [name, widths] of Object.entries(images)) {
      const original = dict[lang][`img.${name}`];
      const srcset = dict[lang][`img.${name}.srcset`];
      assert.ok(original && srcset, `${lang} img.${name}`);
      const list = candidates(srcset);
      assert.deepEqual(
        list.map((c) => c.width),
        widths,
        `${lang} ${name}`,
      );
      assert.equal(list.at(-1).url, original, `${lang} ${name} largest`);
      const [width, height] = webpSize(new URL("." + original, publicDir));
      for (const c of list) {
        assert.match(c.url, new RegExp(`-${lang}(?:-\\d+w)?\\.webp$`));
        const size = webpSize(new URL("." + c.url, publicDir));
        assert.equal(size[0], c.width, c.url);
        assert.equal(size[0] * height, size[1] * width, `${c.url} shape`);
      }
    }
  }
});

test("the Japanese HTML lists the same copies and localizes them", () => {
  const html = read("index.html");
  const dict = dictionary();
  for (const name of Object.keys(images)) {
    const tag = [...html.matchAll(/<img\b[^>]*>/g)]
      .map(([t]) => t)
      .find((t) => t.includes(`src:img.${name}|`));
    assert.ok(tag, name);
    assert.match(
      tag,
      new RegExp(`data-i18n-attr="srcset:img\\.${name}\\.srcset\\|`),
    );
    assert.match(tag, /\bsizes="[^"]+"/, `${name} sizes`);
    assert.match(tag, /\bloading="lazy"/, `${name} lazy`);
    const srcset = tag.match(/\bsrcset="([^"]+)"/)[1];
    assert.deepEqual(
      candidates(srcset),
      candidates(dict.ja[`img.${name}.srcset`]),
      name,
    );
  }
});
