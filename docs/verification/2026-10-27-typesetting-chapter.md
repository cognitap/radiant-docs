# Chapter 05: typesetting verification and promotion (DEV-169)

The DEV-169 docs branch is stacked on DEV-168, rather than duplicating its diff.
The coordinated Radiant PR #57 prepares the 0.0.5 native typography/axis artifact;
publish through the existing main-only release workflow, verify registry integrity
against that workflow's receipt, then install/pin that exact registry version.
No file dependency, workspace alias, source compiler or Storybook asset belongs
in the public docs artifact.

## Recorded font examples

| Starting point | Prose size/leading/measure | UI size/leading | Recommendation scope                              |
| -------------- | -------------------------- | --------------- | ------------------------------------------------- |
| Inter          | 20px / 1.6 / 64ch          | 16px / 1.5      | Studied Body/UI; Code uses Plex Mono              |
| Source Serif   | 21px / 1.65 / 62ch         | 16px / 1.5      | Studied serif Body/Headings; Inter UI             |
| Plex           | 20px / 1.6 / 62ch          | 16px / 1.5      | Studied Plex Sans Body/UI; Plex Mono Code         |
| Custom         | 20px / 1.65 / 64ch         | 16px / 1.5      | Manual/uncalibrated Body; independent UI retained |

Sizes are reference values at a 16px root and compile to rem. The custom example
uses the pinned normal-only Inter TTF under the alias Chapter brand; it proves
local loading, manual profile behavior and missing-file requirements, not unknown
font quality or italic coverage. Axis ranges are available file capabilities;
trial settings are not applied to exported roles.

`verify-typography-chapter.mjs` runs all four configurations through Article,
Form, Data and Landing at 800/640/390/320px in both modes: 128 recorded cases.
It checks loaded families, UI/prose metrics and root reflow. Sixteen representative
captures and a contact sheet preserve visual examples; captions distinguish CSS
width from display scaling. The custom font's removal releases the face while
retaining byte-free portable requirements and fallback/setup guidance.

The contact-sheet inspection covers hierarchy, paragraph rhythm, heading wraps,
form label/supporting text, dense data and landing scale. No clipped content or
root overflow was observed in the recorded matrix. Recipe-owned themes now hide
legacy family/size controls that cannot affect those roles; recipe-free imported
themes retain those working controls until explicitly initialized.

## Existing regression gates

The complete docs gate retains hydration, editing/draft/keyboard/focus,
independent state/reset, full/typography-only export/copy, JSON/share round trips,
missing-file/retry/cleanup, scope/mode/component/caller overrides and both styling
routes with/without reset in the isolated installed consumer. The native library
full gate verifies the same prepared artifact's types/runtime, 72 installed
styling, 32 typography, 128 composition and 1,165 Storybook/browser cases.

Raw docs receipts are `output/docs/verification.json` and
`output/docs/typography-chapter/results.json`, with images beside them. Candidate
receipts stay under `output/candidate/docs/`. The workflow release receipt records
source commit and SHA-512 integrity; registry identity and exact lockfile pin are
recorded after publication, before this stacked PR becomes ready for review.

## Limits

Recorded examples validate the supported profile behavior and observed layouts;
they are not a universal readability score. Real font files, coverage, licensing,
fallback and application-specific script/shaping remain the consumer's concern.
No manual screen-reader, Safari or Firefox certification is claimed. The custom
normal-only test fixture does not establish a genuine italic face. Public
promotion does not complete the broader catalog accessibility/compatibility audit.
