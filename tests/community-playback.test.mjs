import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const script = readFileSync(
  new URL("../public/js/community.js", import.meta.url),
  "utf8",
);
const work = {
  workId: "aaaaaaaaaaa",
  title: "Public work",
  youtubeUrl: "https://www.youtube.com/watch?v=aaaaaaaaaaa",
};

function element() {
  return {
    attributes: {},
    children: [],
    handlers: {},
    append(...children) {
      this.children.push(...children);
    },
    before(sibling) {
      this.sibling = sibling;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    addEventListener(name, callback) {
      this.handlers[name] = callback;
    },
  };
}

async function load({ status = "available", playbackHttpStatus = 200 } = {}) {
  const gallery = element();
  const button = {
    ...element(),
    classList: { contains: () => true, toggle() {} },
    dataset: { communityTab: "latest" },
  };
  const document = {
    ...element(),
    documentElement: { lang: "en" },
    createElement: element,
    querySelector: () => gallery,
    querySelectorAll: () => [button],
  };
  let feedReads = 0;
  const navigations = [];
  runInNewContext(script, {
    document,
    window: { location: { assign: (url) => navigations.push(url) } },
    async fetch(path) {
      if (path.includes("playbackId=")) {
        return Response.json({ status }, { status: playbackHttpStatus });
      }
      return Response.json({ works: ++feedReads === 1 ? [work] : [] });
    },
  });
  await new Promise(setImmediate);
  const card = gallery.children[0];
  return {
    card,
    gallery,
    document,
    navigations,
    async click() {
      let prevented = false;
      await card.handlers.click({
        preventDefault: () => {
          prevented = true;
        },
      });
      assert.equal(prevented, true);
      await new Promise(setImmediate);
    },
  };
}

test("a public work opens in the current tab after the status check", async () => {
  const feed = await load();
  assert.equal(feed.card.target, undefined);
  await feed.click();
  assert.deepEqual(feed.navigations, [work.youtubeUrl]);
  assert.equal(feed.gallery.sibling.hidden, true);
});

test("a private work stays closed and refreshes the list with feedback", async () => {
  const feed = await load({ status: "private" });
  await feed.click();
  assert.deepEqual(feed.navigations, []);
  assert.equal(feed.gallery.sibling.attributes.role, "status");
  assert.equal(
    feed.gallery.sibling.textContent,
    "This work is no longer public.",
  );
  assert.equal(
    feed.gallery.children.some((node) => node.href),
    false,
  );
});

test("a failed check leaves the list available and localizes the retry message", async () => {
  const feed = await load({ playbackHttpStatus: 502 });
  await feed.click();
  assert.deepEqual(feed.navigations, []);
  assert.equal(
    feed.gallery.sibling.textContent,
    "Could not open this work. Please try again later.",
  );
  assert.equal(feed.gallery.children[0].href, work.youtubeUrl);
  feed.document.documentElement.lang = "ja";
  feed.document.handlers["niarim:langchange"]();
  assert.match(feed.gallery.sibling.textContent, /作品を開けませんでした/);
});
