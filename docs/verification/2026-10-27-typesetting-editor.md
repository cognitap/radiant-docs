# DEV-166 — Public typesetting editor

27 October 2026. Docs base `7c17221` includes the merged DEV-165 proofs.
No library publication, public dependency change, new font asset or source alias.

## Provenance and checks

- Complete released-package `pnpm check` passed at
  `9088927c803ea39525602e17c3822813bf6b539a`, Node 26.11.1,
  Playwright 1.64.1 / Chromium 156.0.8078.4 on macOS/arm64.
  Static/browser receipt: `2026-10-27T01:59:02.665Z` through
  `2026-10-27T02:01:18.849Z`.
- Complete isolated `pnpm preview:candidate … --check` passed at
  `7422825816377ba8cdb798753e4a8e7d1b62f4ae`, including the explicit legacy-theme
  adoption correction. Receipt: `2026-10-27T02:02:42.467Z` through
  `2026-10-27T02:05:32.081Z`.
- Candidate is the packed Radiant 0.0.5 from merged library main
  `6a2339bfd25e1dd19f8a1efb3026279a0abf74bd`. Archive SHA-256:
  `13c73ded8894ab5c20b34809fa696ec821dc250528ec1655395e0502bc4ad518`.
- Released-package unit gate: 23 pass, four candidate-only cases explicitly
  skipped. Candidate unit gate: all 27 pass, no skips.
- Later small picking/focus changes scope selection to its workshop, include
  implicit semantic paragraphs/quotes in feedback, and pause actions even when
  clicking their padding. The complete editor browser workflow was rerun on
  `99fac0991f03fc138e91755b526179a5fcb97f31`; format/lint/types pass.
  Final-head CI and candidate receipts are linked in the PR and Linear issue.

## Implementation

[TypographyEditor](../../examples/workshop/TypographyEditor.tsx) separates:

- Independent Body / Headings / UI / Code assignments and three named font
  starting points: Inter, Source Serif 4 + Inter, Plex Sans + Plex Mono.
- Prose size, leading, paragraph spacing, measure and heading scale; independent
  UI size/leading. Manual context metrics survive family changes.
- All 16 production text styles: assignment, fixed or fluid endpoint sizing,
  weight, leading, tracking and measure. Explicit overrides survive rhythm and
  assignment changes. A style reset removes only that style override.
- Keyboard style selection and optional pointer picking in real proofs. Picking
  highlights explicit roles and semantic prose without changing HTML semantics;
  proof actions pause while inspection is enabled. Focus reaches the inspector
  in the same workshop. Desktop controls sit beside the shared proof frames.

The small [adapter](../../examples/workshop/workshop-typography.ts) consumes the
public generator. That generator resolves and validates metrics; the public
ThemeDocument parser validates the new section, which the existing compiler
then consumes. Website code does not calculate another scale or emulate missing
library capabilities. Its temporary editor-facing type/capability seam supports
the exact older npm pin until chapter publication.

Every change edits the document's normalized `typography.typesetting` input.
Ordinary edits preserve token/mode overrides and component exceptions; the UI
explains their precedence. A whole starting-point selection/reset clears owned
Typography settings while retaining other sections and proof copy/interactions.
Imported documents with no recipe keep their authored typography and require an
explicit starting point before these controls activate.

The font lab and assignment editor share one session loader. Requests/cache are
per family, pending requests are deduplicated, availability is observed from the
actual session, and removal/disposal aborts pending work and deletes only owned
faces. Four curated families and one replaceable local file remain bounded.
Custom families are manual even if their names resemble a calibrated font;
unsupported requested weights stay visible with range warnings. Real normal
files are required for assignment; italic and verified axes remain in the lab.
Family/weight/style requirements travel in ordinary portable metadata; file
bytes, filenames and object URLs do not.

## Browser evidence

[The new verifier](../../scripts/verify-typesetting-editor.mjs) checks all 16
styles, four assignments, real profile changes, retained context/style overrides,
fixed/fluid sizing, local-container interpolation, unsupported weight retention,
prose/UI/style/starting-point resets and shared proof/form state. It also covers:

- Typing `21` through the unfinished draft `2`, rejected out-of-range drafts,
  last-valid restoration and native arrow stepping.
- An actual local Inter TTF under a new alias: manual profile, out-of-range
  requested weight, removal and retained missing-file requirement/fallback.
- Plain manual CSS families, validation failure without theme loss, legacy theme
  import, explicit Inter adoption, preserved color/component exceptions and
  retained private form values.
- Pointer picking of title and implicit body text, visual selection feedback,
  and a padded landing action that cannot fire while inspecting.
- 1600/390/320px layout, modes, keyboard/focus, distinct normal/italic faces
  without duplicate registration, reset cleanup and reload defaults.

Existing font tests also exercise shared-loader failure/retry, held requests,
reset during loading, local replacement, missing italic and malformed fonts.
The complete gates retain navigation/search, component/forms/compositions,
29 actual copyable workshop source files, color/geometry, shared proof widths,
handoff consumers on both CSS/reset routes and the 12-brand reference checks.
Desktop studio and narrow control captures were visually inspected. Receipts
and screenshots stay ignored under `output/` and CI artifacts.

## Release boundary and limits

Normal builds keep exact Radiant **0.0.4** and the existing font controls with an
honest typesetting availability notice. The role editor operates with the
matching **0.0.5 candidate**; publication/pin promotion remains DEV-169.
Existing components retain installed typography until DEV-167; extended
chapter handoff work remains DEV-168. This change does not add a second export
pipeline or publish an experimental package.

Chromium automation and the recorded specimens do not establish manual
screen-reader, Safari/Firefox, browser-zoom, universal readability or complete
script/shaping coverage. Scaled proofs state their CSS width/display scale;
spacing probes and local trials remain preview-only.
