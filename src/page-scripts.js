/**
 * Which script a page's <script src> is served as (the Worker rewrites the
 * element and preloads the same URL).
 */

// /features/ keeps main.js for its screen mocks; every other page that asks
// for /js/main.js runs the lightweight runtime instead, whatever ?v= the page
// adds (/about/ asked for main.js?v=…, so it ran the whole of main.js while
// its translations were collected for common-ui.js).
export function runtimeScript(page, src) {
  return page !== "features" && /^\/js\/main\.js(?:[?#].*)?$/.test(src)
    ? "/js/common-ui.js"
    : src;
}

// A script of public/js is served without its comments and layout whitespace
// (tools/build-js.mjs writes /js/generated/compact/<name>.js); the source
// files serve static previews.
export function servedScript(src) {
  return src.replace(
    /^\/js\/([\w-]+\.js(?:[?#].*)?)$/,
    "/js/generated/compact/$1",
  );
}
