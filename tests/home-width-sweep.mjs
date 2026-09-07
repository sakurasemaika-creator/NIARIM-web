import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const widths = [
  640, 700, 760, 820, 900, 960, 1024, 1100, 1200, 1280, 1366, 1440,
];
const height = 628;
const edgeTolerance = 2;
const deviceTolerance = 1.25;
const ratioTarget = 320 / 569;
const outDir = path.resolve(
  "artifacts/autonomous-browser-audit/home-width-sweep",
);
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "ja-JP" });
const page = await context.newPage();
const metrics = [];
const deviceFailures = [];

for (const width of widths) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.lang = "ja";
    localStorage.setItem("niarim-lang", "ja");
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(450);

  const row = await page.evaluate(() => {
    const rounded = (value) => Math.round(value * 100) / 100;
    const fromElement = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        left: rounded(r.left),
        top: rounded(r.top),
        width: rounded(r.width),
        height: rounded(r.height),
        right: rounded(r.right),
        bottom: rounded(r.bottom),
      };
    };
    const box = (selector) => fromElement(document.querySelector(selector));
    const visible = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        cs.display !== "none" &&
        cs.visibility !== "hidden" &&
        Number(cs.opacity) > 0.05
      );
    };
    const resolveColor = (value) => {
      if (!value) return "";
      const probe = document.createElement("i");
      probe.style.color = value;
      probe.style.display = "none";
      document.body.appendChild(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    };
    const containment = (host, target) => {
      if (!host || !target) return null;
      const hr = host.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      return {
        name:
          target.getAttribute("data-audit-name") ||
          target.classList[0] ||
          target.tagName.toLowerCase(),
        rect: fromElement(target),
        within:
          tr.left >= hr.left - 1 &&
          tr.right <= hr.right + 1 &&
          tr.top >= hr.top - 1 &&
          tr.bottom <= hr.bottom + 1,
      };
    };

    const visibleHeroPreview = [
      ...document.querySelectorAll(".hero-preview-card"),
    ].filter(visible);
    const devices = visibleHeroPreview.map((card) => {
      const cs = getComputedStyle(card);
      const source = card.querySelector(
        ":scope > .hero-app-preview-source, :scope > .hero-community-mini",
      );
      const sourceStyle = source ? getComputedStyle(source) : null;
      const accent = resolveColor(cs.getPropertyValue("--fd-accent").trim());
      const surface = resolveColor(cs.getPropertyValue("--fd-surface").trim());
      const bg = resolveColor(cs.getPropertyValue("--fd-bg").trim());
      const bezel = resolveColor(cs.getPropertyValue("--hero-bezel").trim());
      const sourceAccent = sourceStyle
        ? resolveColor(sourceStyle.getPropertyValue("--fd-accent").trim())
        : "";
      const sourceSurface = sourceStyle
        ? resolveColor(sourceStyle.getPropertyValue("--fd-surface").trim())
        : "";
      const sourceBg = sourceStyle
        ? resolveColor(sourceStyle.getPropertyValue("--fd-bg").trim())
        : "";
      let accentSample = null;
      if (card.classList.contains("hero-preview-canvas")) {
        accentSample = card.querySelector(".fd-toolbar .is-active");
      } else if (card.classList.contains("hero-preview-timeline")) {
        accentSample = card.querySelector(".fd-tl-frame.is-current");
      } else if (card.classList.contains("hero-preview-community")) {
        accentSample = card.querySelector(".hero-community-fab");
      }
      let renderedAccent = "";
      if (accentSample) {
        const sampleStyle = getComputedStyle(accentSample);
        renderedAccent = card.classList.contains("hero-preview-timeline")
          ? sampleStyle.borderTopColor
          : card.classList.contains("hero-preview-community")
            ? sampleStyle.backgroundColor
            : sampleStyle.color;
      }
      const critical = [];
      if (source) critical.push(containment(card, source));
      if (card.classList.contains("hero-preview-canvas")) {
        critical.push(
          containment(source, card.querySelector(".fd-topbar")),
          containment(source, card.querySelector(".fd-toolbar")),
          containment(source, card.querySelector(".fd-frame-strip")),
        );
      } else if (card.classList.contains("hero-preview-timeline")) {
        critical.push(
          containment(source, card.querySelector(".fd-timeline-preview")),
          containment(source, card.querySelector(".fd-transport")),
          containment(source, card.querySelector(".fd-scene-line")),
          containment(source, card.querySelector(".fd-tl-frame.is-current")),
          containment(source, card.querySelector(".fd-end-card-row")),
        );
      } else if (card.classList.contains("hero-preview-community")) {
        critical.push(
          containment(source, card.querySelector(".hero-community-appbar")),
          containment(source, card.querySelector(".hero-community-tabs")),
          containment(source, card.querySelector(".hero-community-grid")),
          containment(source, card.querySelector(".hero-community-fab")),
        );
      }
      const r = card.getBoundingClientRect();
      return {
        classes: card.className,
        rect: fromElement(card),
        ratio: r.height ? rounded(r.width / r.height) : null,
        theme: { accent, surface, bg, bezel },
        sourceTheme: {
          accent: sourceAccent,
          surface: sourceSurface,
          bg: sourceBg,
        },
        renderedAccent,
        critical: critical.filter(Boolean),
      };
    });

    return {
      header: box(".site-header"),
      hero: box(".hero"),
      container: box(".hero .container"),
      copy: box(".hero-copy"),
      visual: fromElement(visibleHeroPreview[0]) || box(".hero-visual"),
      marquee: box(".marquee-section"),
      viewportHeight: window.innerHeight,
      devices,
    };
  });

  row.width = width;
  row.heroMarqueeGap =
    row.hero && row.marquee
      ? Math.round((row.marquee.top - row.hero.bottom) * 10) / 10
      : null;
  row.marqueeBottomDelta = row.marquee
    ? Math.round((row.marquee.bottom - height) * 10) / 10
    : null;
  row.marqueeFullyVisible = Boolean(
    row.marquee && row.marquee.top >= 0 && row.marquee.bottom <= height + 0.5,
  );
  row.marqueeAttachedToHero = Boolean(
    row.heroMarqueeGap !== null &&
      Math.abs(row.heroMarqueeGap) <= edgeTolerance,
  );
  row.marqueeEndsAtViewport = Boolean(
    row.marqueeBottomDelta !== null &&
      Math.abs(row.marqueeBottomDelta) <= edgeTolerance,
  );

  if (width >= 1280) {
    const devices = row.devices || [];
    if (devices.length !== 3) {
      deviceFailures.push({
        width,
        kind: "hero-device-count",
        actual: devices.length,
      });
    } else {
      const base = devices[0].rect;
      const themes = new Set(
        devices.map((device) =>
          JSON.stringify([
            device.theme.accent,
            device.theme.surface,
            device.theme.bg,
            device.theme.bezel,
          ]),
        ),
      );
      if (themes.size !== 3) {
        deviceFailures.push({ width, kind: "hero-theme-not-distinct", devices });
      }
      for (const device of devices) {
        if (
          Math.abs(device.rect.width - base.width) > deviceTolerance ||
          Math.abs(device.rect.height - base.height) > deviceTolerance
        ) {
          deviceFailures.push({ width, kind: "hero-device-size-mismatch", device });
        }
        if (Math.abs(device.ratio - ratioTarget) > 0.004) {
          deviceFailures.push({
            width,
            kind: "hero-device-ratio",
            target: ratioTarget,
            device,
          });
        }
        if (
          !device.theme.accent ||
          !device.theme.surface ||
          !device.theme.bg ||
          !device.theme.bezel ||
          device.sourceTheme.accent !== device.theme.accent ||
          device.sourceTheme.surface !== device.theme.surface ||
          device.sourceTheme.bg !== device.theme.bg
        ) {
          deviceFailures.push({ width, kind: "hero-theme-leak", device });
        }
        if (!device.renderedAccent || device.renderedAccent !== device.theme.accent) {
          deviceFailures.push({ width, kind: "hero-accent-render-mismatch", device });
        }
        const clipped = device.critical.filter((item) => !item.within);
        if (clipped.length) {
          deviceFailures.push({
            width,
            kind: "hero-internal-ui-clipped",
            classes: device.classes,
            host: device.rect,
            clipped,
          });
        }
      }
    }
  }

  metrics.push(row);

  await page.screenshot({
    path: path.join(outDir, `home-${width}x${height}.png`),
    fullPage: false,
  });
}

await fs.writeFile(
  path.join(outDir, "metrics.json"),
  JSON.stringify(metrics, null, 2) + "\n",
);

const geometryFailures = metrics.filter(
  (row) =>
    !row.marqueeFullyVisible ||
    !row.marqueeAttachedToHero ||
    !row.marqueeEndsAtViewport,
);
const failures = [
  ...geometryFailures.map((row) => ({
    width: row.width,
    kind: "628-marquee-geometry",
    heroBottom: row.hero?.bottom ?? null,
    marqueeTop: row.marquee?.top ?? null,
    marqueeBottom: row.marquee?.bottom ?? null,
    heroMarqueeGap: row.heroMarqueeGap,
    marqueeBottomDelta: row.marqueeBottomDelta,
  })),
  ...deviceFailures,
];

if (failures.length) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        targetHeight: height,
        edgeTolerance,
        deviceTolerance,
        failures,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        ok: true,
        targetHeight: height,
        edgeTolerance,
        widths: widths.length,
        threeDeviceWidths: widths.filter((width) => width >= 1280),
        checks: [
          "hero touches black marquee",
          "marquee bottom matches 628px viewport",
          "three hero devices have equal rendered size",
          "three hero devices keep 320:569 ratio",
          "three hero themes remain distinct and inherit into inner UI",
          "canvas/timeline/community accents render from their own theme",
          "critical internal UI stays inside each device",
        ],
      },
      null,
      2,
    ),
  );
}

await browser.close();
