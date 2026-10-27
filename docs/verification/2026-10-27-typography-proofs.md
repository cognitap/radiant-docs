# DEV-165 — Editable responsive typography proofs

27 October 2026. Docs base: merged main `1a6cca9` (DEV-164). Library candidate:
merged Radiant main `6a2339bfd25e1dd19f8a1efb3026279a0abf74bd` (DEV-163).

## Provenance

The complete released-package `pnpm check` and isolated candidate
`pnpm preview:candidate /private/tmp/cognitap-radiant-0.0.5.tgz --check` passed on
clean source `f67cc49712032a6bc70403c780075adcfc962e31`.

- Released static-export receipt: `2026-10-27T01:26:49.397Z` through
  `2026-10-27T01:29:13.756Z`, Radiant 0.0.4, status `passed`.
- Candidate static-export receipt: `2026-10-27T01:27:09.780Z` through
  `2026-10-27T01:29:50.403Z`, Radiant 0.0.5, status `passed`.
- Candidate archive SHA-256:
  `13c73ded8894ab5c20b34809fa696ec821dc250528ec1655395e0502bc4ad518`.
- Node 26.11.1, pnpm 12.11.2, Playwright 1.64.1,
  Chromium 156.0.8078.4, macOS/arm64.

Visual inspection prompted a small composition follow-up at
`d7a67620c7a1a06d8b4b83f257a45986896e6dab`: group the article header separately
from paragraph flow, space the code region using the compiled paragraph-flow
variable, and name native comparison figures. Formatting, lint, types, static
builds and the full typography browser matrix were rerun for both the released
package and packed candidate on that revision. The full general gate above
precedes that layout-only follow-up; PR CI verifies the final delivery revision.
This evidence-only commit does not change the implementation.

## Behavior and verification

The new website-owned [proof pages](../../examples/workshop/ProofPages.tsx)
consume Radiant's public `data-rad-text`, `data-rad-prose` and
`data-rad-type-container` hooks. The website owns compositions, content,
inspection and font loading. There is no copied scale algorithm, fallback
compiler, source alias, new font bundle, dependency change or library publication.

Four compositions cover article prose, a real Radiant form with validation,
metrics/dense data and a landing page. Each combines relevant prose/UI styles;
Body, Headings, UI and Code assignments remain distinct from those text styles.
Copy fields include headings, paragraphs, labels, help, links, lists, metrics,
table headings/project names and code. Overrides render as plain React text;
untouched passages retain their original inline markup.

The [browser verifier](../../scripts/verify-typography-proofs.mjs) proves:

- One copy and interaction owner across 800/640/390/320px frames and the 800+390
  comparison. Form values, checkbox state, validation/save feedback, table
  filters/empty results and landing actions update both frames.
- Copy survives switching widths/compositions/editors. Plain text containing
  HTML remains literal. Default inline emphasis survives until that passage is
  edited and returns on reload. Comparison controls/anchors have unique IDs.
- Current-proof reset restores only that composition's copy/interactions.
  Typography reset preserves proof interactions and colors. Theme and preview
  mode changes reach every frame, without changing shared content.
- Candidate headings respond to their local content container; body is 20px,
  code is 14px and paragraph flow is 25px for the accepted baseline. Site prose
  code styles are excluded from these proofs rather than overriding their roles.
- Four compositions × five layouts × two modes × three viewports
  (1440/390/320px). Fixed internal CSS widths remain real while displayed frames
  report their scale. Surrounding pages and frames do not overflow.
- Named code/table regions support native keyboard scrolling. Invalid form
  submission focuses its actual control. The spacing probe remains preview-only.
- Reload restores session copy/interaction defaults. No hydration, runtime or
  ResizeObserver errors occurred in the checked flows.

The complete gates also retain five hosting tests, 22 existing workshop tests,
static/direct loads and exact copyable source (26 workshop files), font trials,
color/geometry editors, navigation/search, actions, controls, compositions,
handoff consumers across both CSS routes/reset choices and 12-brand references.
Screenshots/receipts are ignored under `output/docs`, `output/candidate` and
`output/candidate-final`; CI retains browser/static-export evidence as artifacts.
Desktop article/data/landing and narrow form captures were visually inspected.

## Release boundary and limits

The public package pin stays exactly **0.0.4**. That version displays editable
semantic proofs with an explicit notice that the new typography roles are
unavailable. The matching **0.0.5 packed candidate** proves responsive role
styling. The local candidate preview is clearly labeled and does not change the
manifest/lockfile. DEV-166 owns the complete role/rhythm editor, DEV-167 owns
component adoption, DEV-168 owns typography handoff extensions, and DEV-169 owns
publication/promotion and final chapter acceptance.

Scaled previews and a spacing probe do not establish comfortable reading,
actual browser zoom, full accessibility or universal font/script coverage.
Evidence covers Chromium automation and the inspected screenshots; manual
screen-reader, Safari and Firefox checks remain unclaimed. Product controls
retain the installed release's typography until deliberate role adoption.
