# Screen Mock Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Home and Features app-screen reproductions visually match the current NIARIM app captures, while preserving unique showcase themes, and fix the requested footer/header/contact UI regressions.

**Architecture:** Treat each mock as one complete app viewport with one scale origin. Geometry comes from the app implementation/capture; theme tokens are applied separately at the showcase slot level. Remove late CSS that invents controls or mixes coordinate systems. Add regression checks for overlap, visibility, readable sizing, theme uniqueness, and contact/header/footer details.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, Playwright visual audits, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-screen-mock-fidelity-design.md`

## Global Constraints

- Work only on `dev_branch`.
- Do not read or update comprehensive audit Route/State files.
- App `sakurasemaika-creator/NIARIM` `dev_branch` is authoritative for UI structure.
- Real app captures are authoritative for rendered geometry.
- Intentional visual differences are limited to omitted advertising and per-showcase unique theme/appearance substitution including bezel color.
- Home and Features screen reproductions are the primary scope.
- If responsive DOM reproduction remains fragile or unreadable after a focused reconstruction pass, replace only that screen with a real app screenshot captured after changing the app theme/appearance for that showcase slot.

---

### Task 1: Add failing invariants for the reported screen-mock regressions

**Files:**

- Modify: `tests/mock-detail-audit.mjs`
- Modify: `tests/final-visual-invariants-audit.mjs`

**Interfaces:**

- Consumes: existing DOM classes under `.fd-app-screen`, `.fd-route-screen`, `.feature-diagram`.
- Produces: regression failures for frame-marker overlap, hidden frame list/art, collapsed toolbars, nested bezel, invisible key labels, crushed controls, and unexpected viewport gutters.

- [ ] Add assertions that the centered frame cursor does not intersect frame-mode/add/tool controls and that a selected/current frame remains centered beneath it.
- [ ] Add assertions that frame thumbnail artwork is visible and non-empty in Canvas-based mocks.
- [ ] Add assertions that Hero screen controls remain distributed across the expected viewport width rather than collapsing around center.
- [ ] Add assertions for single bezel, no unexplained inner gutter, key-label contrast, and minimum rendered control size.
- [ ] Run the focused audit and confirm current production fails on at least one reported symptom before implementation.

### Task 2: Normalize Home/Features screen geometry to one coordinate system

**Files:**

- Modify: `public/css/screen-mock-accuracy.css`
- Modify: `public/css/screen-mock-frame-alignment.css`
- Modify: relevant mock fidelity/base CSS only where needed
- Modify: `public/js/main.js` only if DOM structure itself differs from the app

**Interfaces:**

- Consumes: canonical app logical viewport and existing mock DOM.
- Produces: one-scale-origin compositions with app-faithful control ordering, spacing, frame strip, panels, and outer bezel.

- [ ] Remove pseudo-element replacements for real frame-mode controls and any 140px reservation that conflicts with centered-frame behavior.
- [ ] Remove mixed 320x569/360x760 assumptions from the same reconstructed screen; assign a canonical viewport per screen.
- [ ] Correct Hero screen 1 toolbar grouping, frame-list visibility, frame preview art, and centered fixed current-frame marker.
- [ ] Correct Hero screen 2 inner viewport gutter/panel placement.
- [ ] Correct Hero screen 3 single continuous bezel and thumbnail-scale recognisability.
- [ ] Repeat the same capture-driven correction for every Home feature row, Home App Preview card, and Features-page reconstruction.
- [ ] If a screen still requires fragile breakpoint-specific hacks or becomes unreadable, switch only that screen to a distinct-theme real-app capture fallback.

### Task 3: Preserve unique showcase themes without altering geometry

**Files:**

- Modify: `public/css/screen-mock-contrast-palettes.css`
- Modify: other palette file only if selector precedence is incorrect

**Interfaces:**

- Consumes: stable app-faithful geometry from Task 2.
- Produces: unique accent/background/panel/bezel theme identity per showcase slot.

- [ ] Ensure theme variables are applied at the showcase root and inherited by the complete screen composition.
- [ ] Remove any late rules that reset all mocks to the default app pink palette.
- [ ] Verify no duplicate accent/bezel identities among peer Home gallery and Features screens.
- [ ] Verify dark and light presets keep readable text/icon contrast including `作品広場`.

### Task 4: Remove footer separator and repair header hover underline alignment

**Files:**

- Modify: `public/css/visual-finish.css`
- Modify: the header/navigation stylesheet that owns hover underline geometry
- Test: existing responsive/browser audit plus focused DOM geometry assertion

**Interfaces:**

- Produces: no `.site-footer::before` decoration; hover underline centered directly under each navigation label.

- [ ] Delete all `.site-footer::before` declarations, including responsive overrides.
- [ ] Measure nav label and underline rectangles on desktop and mobile-capable header states.
- [ ] Adjust underline positioning/width so its center matches the text label center and it sits at a visually consistent gap below the glyphs.
- [ ] Add/extend an audit assertion for underline/text center delta.

### Task 5: Resize and vertically align the Contact consent checkbox

**Files:**

- Modify: `public/css/pages/contact.css`
- Test: contact-page Playwright audit

**Interfaces:**

- Consumes: `<label class="form-checkbox"><input id="agree">...</label>`.
- Produces: 25x25 checkbox with visually centered consent copy in all supported languages.

- [ ] Add a failing assertion that `#agree` is 25x25 CSS px.
- [ ] Add a failing assertion comparing checkbox centerY with the first-line/label visual center within a small tolerance.
- [ ] Set checkbox width/height/flex-basis to 25px and remove any rule forcing 36px.
- [ ] Tune `.form-checkbox` alignment, line-height, and gap from real browser captures until the Japanese consent line and checkbox read as one aligned row; verify wrapping states in the other six languages.

### Task 6: Full capture comparison and acceptance

**Files:**

- Modify: visual audit scripts only where required to capture evidence
- Evidence: generated Home/Features screenshots and isolated mock captures

**Interfaces:**

- Produces: final app-vs-Web comparison evidence and green regression suite.

- [ ] Generate fresh isolated Web captures for every Home and Features app-like visual.
- [ ] Compare each against the matching real app capture, normalizing only theme substitution and omitted advertising.
- [ ] Inspect outer bounds, top controls, content bounds, toolbars, panels, frame/timeline strips, text, thumbnails, bottom controls, clipping, and empty margins.
- [ ] Fix every unexplained mismatch found during eye review, not only the originally reported items.
- [ ] Run format/build/browser/final-matrix checks and confirm zero relevant failures.
- [ ] Confirm fallback screenshots, if any, were captured from the real app using distinct appearance/theme presets.
