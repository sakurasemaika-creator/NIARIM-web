from pathlib import Path
import re

css_path = Path("public/css/home-hero-responsive-final.css")
css = css_path.read_text()
replacement = r'''@media (max-width: 559px) {
  html body .hero {
    padding-top: clamp(0.9rem, 3.4vw, 1.2rem) !important;
    padding-bottom: clamp(0.8rem, 3vw, 1.05rem) !important;
  }

  html body .hero .container {
    position: relative !important;
    width: calc(100% - 1.5rem) !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(112px, 38%) !important;
    grid-template-rows: auto auto auto auto auto auto !important;
    align-items: start !important;
    justify-items: stretch !important;
    column-gap: clamp(0.55rem, 2.6vw, 0.8rem) !important;
    row-gap: clamp(0.42rem, 1.8vw, 0.62rem) !important;
  }

  html body .hero-copy {
    display: contents !important;
  }

  html body .hero-copy > .eyebrow {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
    margin: 0 !important;
  }

  html body .hero-copy > .hero-title {
    grid-column: 1 / -1 !important;
    grid-row: 2 !important;
    margin: 0 !important;
  }

  html body .hero-copy > .hero-subtitle {
    grid-column: 1 / -1 !important;
    grid-row: 3 !important;
    margin: 0 !important;
  }

  html body .hero-copy > .hero-lead {
    grid-column: 1 !important;
    grid-row: 4 !important;
    align-self: start !important;
    margin: 0 !important;
    max-width: none !important;
  }

  html body .hero-visual,
  html body .hero-showcase {
    grid-column: 2 !important;
    grid-row: 4 !important;
    width: clamp(112px, 34vw, 145px) !important;
    max-width: 145px !important;
    min-width: 0 !important;
    justify-self: end !important;
    align-self: start !important;
    margin: 0 !important;
  }

  html body .hero-copy > .hero-actions {
    grid-column: 1 / -1 !important;
    grid-row: 5 !important;
    margin: 0 !important;
    gap: 0.45rem !important;
    flex-wrap: nowrap !important;
  }

  html body .hero-copy > .hero-bridge {
    grid-column: 1 / -1 !important;
    grid-row: 6 !important;
    display: block !important;
    margin: 0 !important;
    max-width: none !important;
  }

  html body .hero-title {
    max-width: 100% !important;
    font-size: clamp(2rem, 8.8vw, 2.6rem) !important;
    line-height: 0.98 !important;
  }

  html body .hero-subtitle {
    font-size: clamp(0.78rem, 2.65vw, 0.9rem) !important;
    line-height: 1.35 !important;
  }

  html body .hero-lead {
    font-size: clamp(0.7rem, 2.25vw, 0.8rem) !important;
    line-height: 1.48 !important;
  }

  html body .hero-actions .btn {
    min-width: 0 !important;
    min-height: 40px !important;
    padding: 0.56rem 0.62rem !important;
    flex: 1 1 0 !important;
    font-size: clamp(0.7rem, 2.4vw, 0.82rem) !important;
  }

  html body .hero-bridge {
    font-size: clamp(0.62rem, 2vw, 0.72rem) !important;
    line-height: 1.42 !important;
  }
}

@media (max-width: 339px) {
  html body .hero .container {
    width: calc(100% - 1.1rem) !important;
    grid-template-columns: minmax(0, 1fr) minmax(104px, 37%) !important;
    column-gap: 0.48rem !important;
    row-gap: 0.38rem !important;
  }

  html body .hero-title {
    font-size: clamp(1.9rem, 9vw, 2.18rem) !important;
  }

  html body .hero-subtitle {
    font-size: 0.76rem !important;
  }

  html body .hero-lead {
    font-size: 0.68rem !important;
    line-height: 1.44 !important;
  }

  html body .hero-visual,
  html body .hero-showcase {
    width: clamp(104px, 33vw, 116px) !important;
    max-width: 116px !important;
  }

  html body .hero-actions .btn {
    min-height: 38px !important;
    padding: 0.5rem 0.45rem !important;
    font-size: 0.68rem !important;
  }

  html body .hero-bridge {
    font-size: 0.6rem !important;
    line-height: 1.38 !important;
  }
}

'''
pattern = re.compile(r'@media \(max-width: 559px\) \{.*?(?=@media \(min-width: 560px\))', re.S)
css2, count = pattern.subn(replacement, css, count=1)
if count != 1:
    raise SystemExit(f"expected one compact SP ownership block, replaced {count}")
css_path.write_text(css2)

test_path = Path("tests/intermediate-width-home-audit.mjs")
test = test_path.read_text()
if "const firstFoldWidths" not in test:
    test = test.replace(
        "const captureWidths = new Set(widths);",
        "const captureWidths = new Set(widths);\nconst firstFoldWidths = new Set([320, 339, 360, 375, 390, 414]);",
    )
test = test.replace(
    "viewport: { width, height: 900 },",
    "viewport: { width, height: firstFoldWidths.has(width) ? 667 : 900 },",
)
if "viewportHeight: window.innerHeight" not in test:
    test = test.replace(
        "scrollWidth: Math.max(de.scrollWidth, document.body.scrollWidth),",
        "scrollWidth: Math.max(de.scrollWidth, document.body.scrollWidth),\n        viewportHeight: window.innerHeight,",
    )
if "first-fold-${width}px-${language}.png" not in test:
    anchor = """        screenshots.push(file);\n      }\n    }\n\n    const id = `${width}px/${language}`;"""
    insert = """        screenshots.push(file);\n      }\n    }\n\n    if (firstFoldWidths.has(width)) {\n      const file = `first-fold-${width}px-${language}.png`;\n      await page.screenshot({\n        path: path.join(outDir, file),\n        animations: \"disabled\",\n        fullPage: false,\n      });\n      screenshots.push(file);\n    }\n\n    const id = `${width}px/${language}`;"""
    if anchor not in test:
        raise SystemExit("first-fold screenshot insertion anchor missing")
    test = test.replace(anchor, insert, 1)

sp_block = r'''    if (width <= 559) {
      if (trackCount < 2 || state.copyDisplay !== "contents") {
        failures.push({ id, kind: "sp-compact-composition-lost", state });
      }
      const leadVisualGap = horizontalGap(state.lead, state.visual);
      if (overlaps(state.lead, state.visual)) {
        failures.push({ id, kind: "sp-lead-phone-overlap", state });
      }
      if (leadVisualGap !== null && leadVisualGap < 8) {
        failures.push({ id, kind: "sp-lead-phone-too-tight", leadVisualGap, state });
      }
      if (
        Math.abs(state.lead.top - state.visual.top) > 4 ||
        state.actions.top < Math.max(state.lead.bottom, state.visual.bottom) + 4
      ) {
        failures.push({ id, kind: "sp-row-flow-broken", state });
      }
      if (state.bridge.top < state.actions.bottom - 2) {
        failures.push({ id, kind: "sp-actions-bridge-overlap", state });
      }
      const minPhone = width <= 339 ? 100 : 108;
      if (state.visual.width < minPhone || state.visual.width > 146) {
        failures.push({ id, kind: "sp-phone-size-outlier", state });
      }
      if (state.visualOwner === "showcase" && state.visibleCards.length !== 1) {
        failures.push({ id, kind: "sp-showcase-card-count", state });
      }
      if (state.paddingTop > 24 || state.paddingBottom > 22) {
        failures.push({ id, kind: "sp-padding-too-loose", state });
      }
      if (firstFoldWidths.has(width) && state.marquee.top > state.viewportHeight) {
        failures.push({
          id,
          kind: "sp-marquee-below-first-fold",
          marqueeTop: state.marquee.top,
          viewportHeight: state.viewportHeight,
          state,
        });
      }
'''
sp_pattern = re.compile(r'    if \(width <= 559\) \{.*?(?=    \} else if \(width <= 732\) \{)', re.S)
test2, count = sp_pattern.subn(sp_block, test, count=1)
if count != 1:
    raise SystemExit(f"expected one SP audit block, replaced {count}")
test_path.write_text(test2)
