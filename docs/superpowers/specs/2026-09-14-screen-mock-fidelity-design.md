# NIARIM Web Screen Mock Fidelity Design

Date: 2026-09-14
Scope: `sakurasemaika-creator/NIARIM-web` `dev_branch`
Mode: normal task (do not read or update audit Route/State)

## Goal

Bring every app-screen representation on the NIARIM website into visual agreement with the current NIARIM app implementation and real app captures, while preserving the website's product-showcase intent.

The primary implementation strategy is:

- structure, geometry, control ordering, spacing, sizing, frame/timeline state, labels, icon placement, panel placement, and outer-frame shape follow the real app;
- advertising is intentionally omitted from website showcase images;
- each showcase screen uses a distinct appearance/theme preset, including the outer bezel, so no two showcased screens use the same theme identity;
- the same screen reconstruction must remain legible and recognisable when rendered as a thumbnail or hero miniature.

If a particular screen cannot meet the fidelity and legibility criteria as a responsive DOM reconstruction without fragile per-breakpoint hacks, that screen switches to the fallback strategy: capture the real app after changing its appearance/theme preset specifically for that showcase slot, then use that themed real-app capture as the website visual.

## Source of truth

1. Current `sakurasemaika-creator/NIARIM` `dev_branch` widget implementation is authoritative for UI structure and behavior.
2. Real app captures are authoritative for final rendered geometry and visual state.
3. Existing Web exact references under `public/assets/app-reference/` are comparison assets, not permission to copy stale geometry when the app implementation has moved on.
4. Website theme/color substitution is the only intentional visual divergence from the app UI, apart from omitted advertising.

Existing exact Web reference set currently includes Canvas, Layer panel, Onion skin, and Timeline. Additional references must be produced for every website screen representation that does not yet have an app-side comparison capture.

## Screens in scope

All app-like visuals on Home and Features pages are in scope, including:

- Hero visual 1 / 2 / 3;
- Home feature rows;
- Home App Preview cards;
- Features-page screen reconstructions;
- Canvas default;
- Layer panel;
- Onion skin;
- Timeline;
- save/tree and workspace/theme screens;
- export;
- audio/material-related views;
- any Community / `作品広場` app-style preview used inside the website;
- frame-strip thumbnails and timeline thumbnails inside those screens.

No app-like visual is considered correct merely because its parent card fits or CI reports no page overflow.

## Required hero corrections

Hero is treated as three independent screen compositions, not one CSS transform copied three times.

### Hero screen 1

Must reproduce the real Canvas layout:

- top controls remain in their real left/right groups rather than collapsing toward the center;
- toolbar controls keep the real order and horizontal spacing;
- frame list remains visible;
- frame thumbnails contain recognisable preview artwork;
- the current-frame marker stays horizontally centered in the app screen;
- the frame list moves under that fixed marker without overlapping mode controls or buttons;
- no synthetic ad reservation is present;
- no control is clipped by the bezel.

### Hero screen 2

- no unexplained inner margin between bezel and reconstructed app viewport;
- app content fills the intended screen viewport exactly;
- internal panel/sheet geometry follows the real capture rather than inheriting generic card padding;
- no duplicate outer frame.

### Hero screen 3

- one continuous bezel with natural corner geometry;
- no nested or deformed border caused by scaled child borders;
- controls and content use the same coordinate system as the app capture;
- thumbnail-scale UI remains recognisable rather than becoming an indistinct block.

## Frame-strip contract

The frame list follows the previously established website showcase behavior while preserving real app dimensions:

- current-position marker is fixed to the horizontal center of the app viewport;
- frame cells move beneath it;
- current cell and fixed marker must not create a doubled thick selection border;
- marker may not overlap mode-switch controls, add-frame controls, toolbar controls, or adjacent action buttons;
- frame preview art must be present and correspond visually to the main canvas/project preview;
- frame cells retain the real app aspect/size relationship before scale is applied;
- no pseudo-element replacement may hide or duplicate the actual mode control.

## Theme / appearance contract

Theme substitution is deliberate and separate from geometry.

For every showcased screen slot:

- assign a unique theme identifier;
- use a unique accent family with no duplicate accent among peer showcase screens;
- use a unique bezel value aligned with that theme;
- apply the theme to internal app surfaces according to the app's actual appearance/theme system rather than recoloring arbitrary elements;
- preserve readable text and icon contrast after substitution;
- do not force all screens back to the default pink theme in a late cascade layer.

Dark and light appearance presets should both be represented where the app supports them.

## Readability contract

A screen is not considered faithful if shrinking makes its UI unintelligible.

At each final rendered size:

- essential labels such as `作品広場` remain visibly readable;
- icons remain distinguishable from adjacent controls;
- thumbnails show meaningful content rather than flat blobs;
- active/selected states remain discernible;
- text color must meet practical contrast against the themed surface;
- no transform-based fit may reduce critical UI below the established minimum readable size.

If a DOM reconstruction only passes by shrinking the entire screen until UI becomes unreadable, it fails and must be re-laid out or switched to the themed real-capture fallback.

## Geometry strategy

Stop mixing incompatible historical coordinate systems.

Each reconstructed screen gets one canonical logical viewport derived from its corresponding real app capture. All screen-specific geometry is expressed relative to that viewport. Website card sizing may scale the complete composition, but later CSS layers must not independently re-scale individual subtrees.

Specifically:

- eliminate legacy rules that simultaneously assume 320x569 and 360x760 for the same screen;
- eliminate per-screen transform overrides that change only children while preserving a differently scaled bezel;
- avoid pseudo-elements that substitute for real controls solely to make screenshots look close;
- use one fit step per complete screen composition;
- outer bezel, viewport, and internal UI must share a single scale origin.

## Comparison workflow

For each screen:

1. capture the current real app state at a known logical viewport;
2. capture the corresponding Web reconstruction at the same normalized viewport;
3. normalize only the intentional differences: theme colors and omitted advertising;
4. compare side by side and by image difference;
5. correct geometry before cosmetic polish;
6. re-capture after every correction;
7. repeat until no unexplained structural/geometry difference remains.

Comparison categories:

- outer bounds and corner shape;
- app bar/top controls;
- main content/canvas bounds;
- toolbars and button order;
- panel/sheet bounds;
- frame/timeline strip placement;
- current-position marker;
- text baselines and alignment;
- thumbnail content;
- bottom controls;
- clipping/overflow;
- readable contrast;
- unexpected empty margins.

## Fallback decision rule

A screen switches from responsive DOM reconstruction to a themed real-app screenshot when any of the following remains after a reasonable reconstruction pass:

- matching requires multiple breakpoint-specific positional hacks;
- text/icons cannot remain readable at the website's required displayed size;
- nested scaling deforms borders or control spacing;
- the app screen relies on rendering behavior that is impractical to reproduce faithfully in HTML/CSS;
- visual difference remains obvious in side-by-side review despite passing geometric assertions.

Fallback captures must be generated from the real app after changing that screen's appearance/theme preset so the final website still demonstrates NIARIM's customization range. Different showcase slots must use different theme presets.

## CSS architecture correction

The current layered CSS has accumulated contradictory late overrides. The implementation should consolidate screen-mock fidelity so that responsibilities are separated:

- base screen structure and shared metrics;
- per-screen geometry calibrated to app captures;
- per-showcase theme tokens;
- responsive placement of the complete mock within the website layout;
- no late global layer that resets all mock screens to one default app palette or inserts ads.

Existing obsolete rules may be removed or neutralized when they conflict with the canonical screen-specific geometry. Do not preserve contradictory rules merely to keep old tests green.

## Automated regression checks

CI must verify the user-visible invariants rather than suppressing failures.

Required checks include:

- no ad banner inside showcase mocks;
- hero and app-preview outer aspect/bounds match their canonical reference;
- unique accent and bezel theme identities across peer showcase screens;
- current-frame marker centered on the app viewport;
- no overlap between current-frame marker/cell and adjacent controls;
- no doubled selection border;
- frame thumbnails contain non-empty visual content;
- required UI regions are present and visible;
- no unexpected internal empty gutter around the reconstructed viewport;
- no nested/double/deformed bezel;
- key labels have sufficient contrast and are not effectively invisible;
- key controls remain above minimum rendered size;
- final Home/Features screenshots are generated for eye review at desktop and phone widths.

Tests must not filter out or ignore failures for theme duplication, current-frame centering, or canonical screen ratio.

## Verification and acceptance

The task is accepted only when:

1. every app-like website visual has an identified app source/capture;
2. each has a fresh Web capture;
3. side-by-side review shows no unexplained structural or geometry mismatch;
4. all user-reported failures are absent: frame-marker overlap, centered toolbar collapse, missing frame list, unexplained padding, malformed outer bezel, low-contrast `作品広場`, and crushed thumbnail UI;
5. additional issues found during full visual review are fixed as well;
6. theme uniqueness and matching bezel treatment remain intact;
7. CI regression checks pass without exception filters;
8. any fallback screenshot is a real app capture produced with a distinct app appearance/theme preset for that showcase slot.

## Non-goals

- Do not add fictional app functionality.
- Do not show free-tier advertising in promotional screen mocks.
- Do not change the actual NIARIM app UI merely to make the website easier to reproduce.
- Do not update the comprehensive audit Route/State as part of this normal task.
