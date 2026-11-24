// App screen captures are taken in every page language: Japanese is
// <name>.webp (and .avif), the other languages <name>-<lang>.webp next to it
// (public/assets/images/app-captures/source.txt). The same rule is in
// public/js/i18n.js (captureUrl) for the URLs that scripts build.
export const CAPTURE_LANGS = ["en", "es", "fr", "ko", "zh-Hans", "zh-Hant"];

export const CAPTURE_URL =
  /^(.*\/assets\/images\/app-captures\/(?:pc-)?(?:canvas|layers|onion-skin|timeline|audio-editor|save-tree|export|workspace|widget)(?:-v[234])?)(?:-(?:en|es|fr|ko|zh-Hans|zh-Hant))?(\.(?:webp|avif)(?:\?.*)?)$/;

export function localizedCaptureUrl(url, lang) {
  const match = CAPTURE_URL.exec(url || "");
  if (!match) return url;
  const suffix = CAPTURE_LANGS.includes(lang) ? "-" + lang : "";
  return match[1] + suffix + match[2];
}
