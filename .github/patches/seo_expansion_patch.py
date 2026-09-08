from pathlib import Path

path = Path('src/index.js')
text = path.read_text()

marker = 'import { SEO_I18N, SEO_LANGS } from "./generated/seo-i18n.js";\n'
insert = '''import { SEO_I18N, SEO_LANGS } from "./generated/seo-i18n.js";
import {
  applicationSchema,
  ogLocaleAlternateMarkup,
  robotsTxt,
  sitemapXml,
} from "./seo.js";
'''
if text.count(marker) != 1:
    raise SystemExit(f'import marker count={text.count(marker)}')
text = text.replace(marker, insert, 1)

marker = '''    graph.unshift(
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "NIARIM",
        url: `${origin}/`,
        logo: `${origin}/assets/images/logo/app_logo.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "NIARIM",
        publisher: { "@id": `${origin}/#organization` },
        inLanguage: SEO_LANGS,
      },
    );
'''
replacement = marker + '''    graph.push(applicationSchema(origin, SEO_LANGS));
'''
if text.count(marker) != 1:
    raise SystemExit(f'schema marker count={text.count(marker)}')
text = text.replace(marker, replacement, 1)

marker = '''  const alternates = hreflangMarkup(request, env);
  const ogLocale = OG_LOCALES[metadata.lang] || OG_LOCALES.ja;
'''
replacement = '''  const alternates = hreflangMarkup(request, env);
  const ogLocale = OG_LOCALES[metadata.lang] || OG_LOCALES.ja;
  const ogLocaleAlternates = ogLocaleAlternateMarkup(
    OG_LOCALES,
    metadata.lang,
  );
'''
if text.count(marker) != 1:
    raise SystemExit(f'og marker count={text.count(marker)}')
text = text.replace(marker, replacement, 1)

marker = '''        element.append(alternates, { html: true });
        if (schema) {
'''
replacement = '''        element.append(alternates, { html: true });
        element.append(ogLocaleAlternates, { html: true });
        if (schema) {
'''
if text.count(marker) != 1:
    raise SystemExit(f'head marker count={text.count(marker)}')
text = text.replace(marker, replacement, 1)

marker = '''      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(jsonResponse(404, { error: "not_found" }));
      }

      const assetResponse = await env.ASSETS.fetch(request);
'''
replacement = '''      if (url.pathname.startsWith("/api/")) {
        return withSecurityHeaders(jsonResponse(404, { error: "not_found" }));
      }

      const origin = siteOrigin(request, env);
      if (url.pathname === "/robots.txt") {
        return withSecurityHeaders(
          new Response(robotsTxt(origin), {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          }),
        );
      }
      if (url.pathname === "/sitemap.xml") {
        return withSecurityHeaders(
          new Response(sitemapXml(origin, SEO_LANGS), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          }),
        );
      }

      const assetResponse = await env.ASSETS.fetch(request);
'''
if text.count(marker) != 1:
    raise SystemExit(f'fetch marker count={text.count(marker)}')
text = text.replace(marker, replacement, 1)

path.write_text(text)
