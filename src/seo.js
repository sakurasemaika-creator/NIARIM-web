const XML_ESCAPE = /[&<>"']/g;
const XML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export const SEO_PAGE_PATHS = [
  "/",
  "/about/",
  "/community/",
  "/contact/",
  "/faq/",
  "/features/",
  "/help/",
  "/news/",
  "/premium/",
  "/privacy/",
  "/terms/",
];

function escapeXml(value) {
  return String(value).replace(XML_ESCAPE, (char) => XML_ENTITIES[char]);
}

export function localizedUrl(origin, pathname, lang) {
  const url = new URL(pathname, `${String(origin).replace(/\/$/, "")}/`);
  if (lang && lang !== "ja") url.searchParams.set("lang", lang);
  return url.toString();
}

export function robotsTxt(origin) {
  const base = String(origin).replace(/\/$/, "");
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
}

export function sitemapXml(origin, langs) {
  const entries = SEO_PAGE_PATHS.map((pathname) => {
    const alternates = langs
      .map(
        (lang) =>
          `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(localizedUrl(origin, pathname, lang))}" />`,
      )
      .join("");
    const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localizedUrl(origin, pathname, "ja"))}" />`;
    return `<url><loc>${escapeXml(localizedUrl(origin, pathname, "ja"))}</loc>${alternates}${xDefault}</url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>\n`;
}

export function applicationSchema(origin, languages) {
  const base = String(origin).replace(/\/$/, "");
  return {
    "@type": ["SoftwareApplication", "MobileApplication"],
    "@id": `${base}/#app`,
    name: "NIARIM",
    url: `${base}/`,
    applicationCategory: "MultimediaApplication",
    operatingSystem: ["Android", "iOS"],
    inLanguage: languages,
    description:
      "NIARIM is a drawing and animation creation app for turning hand-drawn artwork into animated stories.",
    publisher: { "@id": `${base}/#organization` },
  };
}

export function ogLocaleAlternateMarkup(locales, activeLang) {
  return Object.entries(locales)
    .filter(([lang]) => lang !== activeLang)
    .map(([, locale]) => `<meta property="og:locale:alternate" content="${locale}">`)
    .join("");
}
