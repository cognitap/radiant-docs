# Chapter 04: workshop release evidence (DEV-160)

Radiant 0.0.4 is published with provenance. The owner accepted the production
calibration with **“Ready — keep Balanced defaults.”** This docs change pins the
published package and enables the full editor in normal builds. Final preview
and production deployment receipts belong to
[DEV-160](https://linear.app/cognitap/issue/DEV-160/verify-and-publish-the-palette-and-spacing-workshop-chapter)
and the existing Pages workflow; keep the issue open until those checks pass.

## Released source and artifact

[Radiant PR #53](https://github.com/cognitap/radiant/pull/53) merged as
`eb1010f4f0031711dc848036dae3596c9f65be04`. Its tree matches the reviewed
candidate source `a95866114b7de3b39aa4b056ed4a1658a94ceff5`.
[Source CI](https://github.com/cognitap/radiant/actions/runs/40252974367) and
[main CI](https://github.com/cognitap/radiant/actions/runs/40255180703) passed.

The existing [Release Radiant workflow, run 40255228136](https://github.com/cognitap/radiant/actions/runs/40255228136)
prepared one archive, ran its installed-package checks and publication dry run,
then published that same archive with trusted publishing and verified npm
integrity. The receipt is retained in artifact
`12621668931` / `radiant-eb1010f4f0031711dc848036dae3596c9f65be04-1`.
The registry integrity exactly matches the owner-reviewed local archive:

```text
version: 0.0.4
sha512-0dejL/znZR/NTmuulF3XXcjuE5JsnbqqzeHBKEHoq2ITZ/TPSVMQhyKWsyoxq9MZzh8tIcqqUBcFVzrgukXVrw==
```

npm exposes a SLSA provenance attestation. Published versions are immutable;
publication retries reuse the original workflow archive, as required by the
[release policy](https://github.com/cognitap/radiant/blob/eb1010f4f0031711dc848036dae3596c9f65be04/RELEASE_POLICY.md).
The disposable comparison HTML stays on its separate prototype branch and is
excluded from the release and docs PR.

## Owner decision and defaults

The original DEV-151 choice was **“reshaping on the left looks better.”** The
source remains exact at a numbered anchor, with its original metadata retained.
The owner later requested further calibration across the wall, brand ramp and
semantic UI, then requested named public alternatives and selected **B — Nearby
readable fill**. After inspecting the complete production candidate, the owner
approved release with **“Ready — keep Balanced defaults.”**

Classic, Balanced and Expressive are independently selectable for the full wall
and brand ramp. Balanced starts both. Separate automatic/manual vividness
controls preserve useful supporting families around muted sources. Preset
selection resets only its owned dials and preserves the other treatment, shared
tone settings, working-family choices and pinned semantic colors. Classic keeps
the original reference ramp; Balanced/Expressive use smooth monotone anchor
remapping. Unanchored generation remains an explicit alternative.

Primary fills choose the smallest Oklab distance to the source among swatches
with 4.5:1 text and 3:1 boundaries against both opaque surfaces. Exact source
metadata/anchors remain unchanged when a nearby shade supplies the UI. Explicit
semantic overrides are retained even if they fail. Output remains opaque sRGB;
P3 and silent source adjustment are unsupported.

## Reproducible checks

Use locked Node 26.11.1 / pnpm 12.11.2 in each repository. Library checks are
`pnpm check` and clean-source `pnpm release:prepare`. Docs consume exact registry
0.0.4 in manifest and lockfile; its verified release has a version-specific
minimum-release-age exception. No workspace alias or library source import is
used. The former compatibility declarations/reflection adapters are replaced
by released public functions/types; the library parser validates opaque state.
Explicit `.ts` imports let pure adapters run under Node's type stripping and the
Next build with the same module paths.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
# Optional future-library inspection, isolated from the normal registry pin:
pnpm preview:candidate /absolute/path/to/radiant.tgz --check
```

The library exhaustive gate passes 109 Node tests, 43 installed-package checks,
72 compiled-CSS/Tailwind theme/mode/reset cases, 128 installed compositions and
1,085 browser tests in 259 files. The complete owner-reviewed docs candidate
passed all 17 workshop tests and its full browser gate at
`1a36570e7d9ae3f07280105eb8c73d76e4715d7f`. Normal registry builds must now run all
17 tests without API-availability skips and exercise the same editing proof.

`verify-brand-reference.mjs` checks 12 seeds: violet `#7C3AED`, red `#FF0000`,
blue `#0000FF`, yellow `#FFFF00`, green `#00FF00`, cyan `#00FFFF`, muted plum
`#7F6A75`, pale lavender `#F5E6FF`, dark tint `#17111F`, gray `#808080`, black
and white. Each compares all 198 swatches and six working families against the
installed production engine, checks required contrast pairs, compares actual
light/dark scope variables and visits all five specimens, including invalid
states. This records 24 modes / 120 specimen selections, 12 wall captures,
12 working-palette captures and 24 form captures.

The browser also checks all nine wall/ramp combinations against production
values and resets both to Balanced. Library tests cover strict rendered order,
exact anchors, near-black/white, seeded control limits, independent outputs,
immutable preset data and materialised JSON replay. Configuration/file/share
checks restore an Expressive wall with a Classic ramp, manual overrides and
pinned colors after reload. Desktop/390px controls and representative difficult
brand outputs were visually inspected before owner approval.

The installed handoff proof compiles the actual exported TypeScript and compares
typed ThemeScope with scoped CSS. Full JSON and selective merge/replace imports
preserve unrelated values and component exceptions. Results run through compiled
CSS and real Tailwind, with both reset choices, light/dark/live system,
inherited/nested scopes and all ten families. Focus, disabled, invalid, pending,
modal, font metadata and motion behavior are sampled. General docs checks cover
static/direct routes, source/copy, hydration, keyboard/focus, 320/390px layouts,
malformed input, clipboard failure and preservation of independent specimen state.
Captures and receipts stay ignored in `output/docs/` or `output/candidate/docs/`.

## Publication and deployment

The proof/hydration changes in docs PR #15 merged as `c40c273`. The preset and
registry promotion follow-up is [docs PR #16](https://github.com/cognitap/radiant-docs/pull/16).
Its earlier 0.0.3 preview passed HTTPS verification at tested merge revision
`104249c901957404918f8b68b80cf6730f530bac`; that read-only build is historical
proof, not activation of the new editor.

Promotion uses the established Pages pipeline: exact registry pin → full normal
gate → verified PR preview → reviewed merge → tested main export → verified
unique production URL. `pnpm test:deployment <origin>` runs the full gate over
HTTPS and checks `/deployment.json` against the exact checkout and Radiant
version, with an empty candidate label. Record final source revision, package,
workflow/artifact links and unique production URL in DEV-160 before closing it.
An upload or green build without remote verification is insufficient.

Held-script regressions retain the fixes discovered during preparation: counter,
custom-action and ref buttons remain disabled until handlers hydrate, then native
activation and refs work. Copied examples include the existing hydration helper;
native links retain pre-hydration navigation. Failed historical deployments are
not described as verified by later local checks.

## Limits

Local evidence uses Chromium 156.0.8078.4 on macOS arm64 with system font
fallbacks; CI records its own environment. No manual VoiceOver, Safari/Firefox,
broad device, custom-font loading, chart distinguishability, P3 or stable-library
readiness is claimed. Fonts and specimen form state are excluded from handoff.
Typography and motion remain starter controls for later chapters. Existing
noindex and Pages infrastructure remain. Docs CI artifacts expire after 14 days;
preserve launch evidence before expiry.
