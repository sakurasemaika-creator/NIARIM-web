/**
 * NIARIM公式サイト Workerエントリポイント
 *
 * /api/* と翻訳辞書のみWorkerで処理し、それ以外は Workers Static Assets
 * (env.ASSETS) が public/ ディレクトリの静的ファイルを直接配信する。
 * 翻訳辞書は元ファイルを7言語まとめて管理しつつ、ブラウザへは必要な
 * 1言語だけを抽出して返し、初回転送量とJS解析量を抑える。
 */
import { handleContact } from "./contact.js";
import { jsonResponse } from "./utils.js";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const SUPPORTED_LANGS = new Set([
  "ja",
  "en",
  "zh-Hans",
  "zh-Hant",
  "ko",
  "fr",
  "es",
]);

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function normalizeLang(value) {
  if (!value) return "ja";
  const raw = String(value).trim();
  if (SUPPORTED_LANGS.has(raw)) return raw;

  const lower = raw.toLowerCase();
  if (lower.startsWith("zh")) {
    return lower.includes("hant") || lower.includes("tw") || lower.includes("hk")
      ? "zh-Hant"
      : "zh-Hans";
  }
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("es")) return "es";
  return "ja";
}

function detectRequestLang(url) {
  /*
   * HTMLに直接書かれた辞書scriptは必ず日本語だけを返す。
   * HTML本体の初期文言が日本語なので、Accept-Languageでここを変えると
   * HTMLと辞書の言語が食い違い、部分的に翻訳キーが露出する原因になる。
   * 別言語はi18n.jsがユーザー選択時に ?lang=XX を明示して取得する。
   */
  const explicit = url.searchParams.get("lang");
  return explicit ? normalizeLang(explicit) : "ja";
}

function isI18nDictionaryPath(pathname) {
  return /^\/js\/i18n-dict(?:-[a-z0-9-]+)?\.js$/i.test(pathname);
}

function buildSingleLanguageDictionary(source, lang) {
  /*
   * 各辞書は `var DATA = { ... }; for (var lang in DATA)` という共通形式。
   * DATA部分はJSON互換なので一度JSON.parseし、要求言語だけを小さなJSへ
   * 再構成する。形式が想定外なら安全のため元ファイルをそのまま返す。
   */
  const match = source.match(
    /var\s+DATA\s*=\s*(\{[\s\S]*?\});\s*for\s*\(var\s+lang\s+in\s+DATA\)/
  );
  if (!match) return null;

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch (_) {
    return null;
  }

  const entries = data[lang] || data.ja || {};
  const safeLang = JSON.stringify(lang);
  const safeEntries = JSON.stringify(entries);

  return `/** NIARIM i18n: ${lang} only (edge-filtered) */\n(function(){\n"use strict";\nvar DICT=window.NIARIM_I18N_DICT||(window.NIARIM_I18N_DICT={});\nvar lang=${safeLang};\nvar entries=${safeEntries};\nif(!DICT[lang]) DICT[lang]={};\nfor(var key in entries){DICT[lang][key]=entries[key];}\n})();\n`;
}

async function handleI18nDictionary(request, env, url) {
  const assetUrl = new URL(url);
  assetUrl.search = "";
  const assetRequest = new Request(assetUrl.toString(), request);
  const assetResponse = await env.ASSETS.fetch(assetRequest);
  if (!assetResponse.ok) return assetResponse;

  const source = await assetResponse.text();
  const lang = detectRequestLang(url);
  const filtered = buildSingleLanguageDictionary(source, lang);
  if (!filtered) return assetResponse;

  const headers = new Headers(assetResponse.headers);
  headers.set("Content-Type", "text/javascript; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=86400");
  headers.delete("Vary");
  headers.delete("Content-Length");

  return new Response(filtered, {
    status: 200,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/contact") {
        const response = await handleContact(request, env, ctx);
        return withSecurityHeaders(response);
      }

      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(
          jsonResponse(404, { error: "not_found" })
        );
      }

      if (isI18nDictionaryPath(url.pathname)) {
        const response = await handleI18nDictionary(request, env, url);
        return withSecurityHeaders(response);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(assetResponse);
    } catch (err) {
      console.error("Unhandled error", err);
      return withSecurityHeaders(
        jsonResponse(500, { error: "internal_error" })
      );
    }
  },
};
