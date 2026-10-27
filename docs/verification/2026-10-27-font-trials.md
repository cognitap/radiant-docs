# DEV-164 — Curated and local font trials

27 October 2026. Complete `pnpm check` passed on clean source
`1312b8c98e8be7fedd21ea89e44ec6dac5ce156c`, based on docs main
`a6c1937`. The later delivery commit only adds this evidence record. PR CI
verifies the delivery/merge revision separately.

## Environment and provenance

- macOS 27.0.1 build 26A434, arm64; Node 26.11.1, pnpm 12.11.2.
- Playwright 1.64.1, headless Chromium 156.0.8078.4.
- Exact published `@cognitap/radiant@0.0.4`, unchanged manifest/lockfile, with no
  library source alias or candidate package.
- Full static-export receipt: `2026-10-27T00:55:57.416Z` through
  `2026-10-27T00:57:52.493Z`, status `passed`, source above.
- Fonts: eight unmodified upstream WOFF2 faces, Inter v4.1 / Source Serif 4
  4.005R / pinned IBM Plex. The [manifest](../../public/fonts/workshop/manifest.json)
  records exact URLs/SHA-256; full adjacent SIL OFL licenses accompany the files.
  The separate pinned Inter TTF fixture is not deployed.

The site hosts approximately 2.1 MiB of curated font files; selected families
load their normal/italic pair on demand. The 859 KiB TTF fixture supplies real
local-file browser coverage without CI fetching an upstream font. Binary assets
are separate files, not base64 source or generated captures.

## Results

`pnpm check` passes formatting, lint, source types, five hosting tests, 22
workshop tests (five new font scenarios), production static build and the full
browser smoke gate. That gate retains existing navigation/search, actions,
hydration, form controls, six profile recipe configurations, compositions,
foundations, five workshop specimens, color/geometry editors, share/import/export,
installed handoff consumers on all four CSS/reset routes and the 12-brand
reference checks.

The new [font browser verifier](../../scripts/verify-font-editor.mjs) checks:

- No curated font requests before opening Typography; all eight actual normal/
  italic faces load, with bounded caching and no duplicate faces on reselection.
- Contextual versus manual recommendations, retained manual sample metrics,
  context reset, requested unavailable weights, disabled application of invalid
  choices, real italic, Plex width and automatic/manual optical size controls.
- A real local Inter TTF: inspected weight/optical axes and normal style, actual
  browser load, uncalibrated status and no upload/font request from its bytes.
- A local WOFF2 with explicit metadata and no inferred axes; an actual italic-only
  file remains trial-only. Malformed input retains the previous trial; a corrupt
  font fails visibly and can be replaced successfully.
- Theme/configuration handoff contains family, selected weight and styles with
  `source: local`, excluding filenames, bytes, blob/data URLs and file objects.
  Node checks also prove full/selective and compressed-share round trips.
- Removing a local face preserves its theme requirement with fallback; reset
  releases owned faces. Reset during a held font request prevents late
  registration. Missing curated files expose loading/failure and recover on retry.
- Native keyboard controls, labeled inputs, no page overflow at 390/320 CSS px,
  no hydration/runtime errors, and no local-file option after reload.

Node checks independently verify asset hashes/licenses, contextual metadata,
actual TTF ranges/name/style, bounds/truncation/malformed-axis rejection, invalid
CSS names, and public-document preservation of unrelated theme sections.

The browser checks found a 15px page overflow at 320px after applying a long
custom family. The existing family selector now constrains its label and border
box to the available width; the complete narrow checks pass after that fix.

Desktop and 320px font-panel captures were inspected for wrapping, control
layout, visible loading/requirement copy and sample presentation. Captures and
raw receipts remain ignored in `output/docs/` (CI retains them for 14 days);
fixtures/scripts and this reviewed summary preserve reproduction/provenance.

## Limits and ownership

These results cover Chromium automation and the stated specimens, not manual
screen readers, Safari/Firefox, browser zoom, universal readability or complete
script/shaping coverage. Loaded faces can still use glyph fallback. Italic
codepoint coverage was not independently audited. Local compressed metadata is
deliberately manual; collections are unsupported and file size is capped at
10 MiB. Custom family names identify CSS aliases, not calibrated profiles.

Sample rhythm and axes remain local trial controls. Applying a family changes
the existing shared family/selected body weight and portable font descriptor;
it does not implement the complete role editor or its proof sheets. DEV-165/166
retain that work, DEV-168 owns extended typography handoff, and DEV-169 owns
final production chapter/font/browser acceptance. No library publication or
production deployment was performed by this local verification.
