# Chapter 04: workshop release evidence (DEV-160)

Status: release preparation and installed-candidate proof. **Public editor
promotion is pending the library release and subsequent registry pin.** This
record does not claim a published 0.0.4 package or completed chapter acceptance.

## Source and reproducibility

The library API source is merged main `22446b07767b2efff04796408fef4ed3872792a7`.
[Radiant PR #53](https://github.com/cognitap/radiant/pull/53) adds only the
0.0.4 manifest version and release notes. The prepared local candidate uses its
clean commit `6c3f7a2a1f99760cb65e826f4a8155387e2ac400` and receipt:

```text
version: 0.0.4
sha512-YnP+NdBAn3mqoXbglhCPjQyzeYVs2AZlvWaPR5PNaLqox8FGOtX8+PpzLrylYpHv9Sb/jl3uTeREUWuvEJ3gWQ==
```

Use each repository's locked Node 26.11.1 / pnpm 12.11.2. In the clean library
release checkout run `pnpm install --frozen-lockfile`, `pnpm check`, then
`pnpm release:prepare`. In radiant-docs run:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm preview:candidate /absolute/path/to/radiant/dist/release/radiant.tgz --check
```

The candidate runner installs that archive in an isolated copy. It does not
change the public pin. It retains browser captures and receipts in ignored
`output/candidate/docs/`; registry checks use `output/docs/`. Archive and generated
measurements remain build evidence, rather than committed source.

## Accepted defaults and reference proof

The owner's [DEV-151 decision](https://github.com/cognitap/radiant/blob/22446b07767b2efff04796408fef4ed3872792a7/docs/research/dev-151-calibration-proposal.md)
was **“reshaping on the left looks better.”** Keep the supplied brand exact at a
numbered stop, choose its anchor by lightness, reshape neighboring shades, and
retain the original metadata. Unanchored is an explicit alternative. The
selected output is opaque sRGB, hue-aware lightness and source-derived vividness;
P3 generation and silent source adjustment remain unsupported.

`verify-brand-reference.mjs` exercises all 12 agreed seeds: violet `#7C3AED`,
red `#FF0000`, blue `#0000FF`, yellow `#FFFF00`, green `#00FF00`, cyan `#00FFFF`,
muted plum `#7F6A75`, pale lavender `#F5E6FF`, dark tint `#17111F`, gray
`#808080`, black and white. For each it compares all 198 displayed wall values
and six working-family selections against the installed production engine,
checks the required semantic contrast report, compares actual light/dark scope
variables, visits all five specimens and inspects the invalid component state.

The run retains 12 wall captures, 12 working-palette captures, 24 form captures
and `brand-reference.json`: 24 mode cases / 120 specimen selections. These enable
production visual review against the accepted prototype. Passing measurements
are scoped evidence, not a new aesthetic approval or a promise that arbitrary
role overrides pass contrast. Owner approval of the original method is recorded;
final production visual sign-off must be recorded separately before closing
this chapter.

## Installed-consumer coverage

The library exhaustive gate passes 107 Node tests, 43 installed-package tests,
72 compiled-CSS/Tailwind theme/mode/reset cases, 128 installed composition
cases, and 1,085 browser tests in 259 files. `release:prepare` separately verifies
its one packed archive with all 43 installed checks and an npm dry run.

The docs handoff proof compiles the **actual generated TypeScript**, SSRs against
the installed package, and compares typed `ThemeScope` with exported scoped CSS.
Complete JSON import and selective exported sections under both merge and replace
policies preserve unrelated typography/component settings; merge retains omitted
leaves while replacement restores defaults. Each result runs through compiled CSS
and a real Tailwind build, each with and without reset, in light/dark/live system
modes. Inherited and nested reset scopes, the ten existing families,
focus/disabled/invalid/modal states, font metadata, motion and component exceptions
are sampled. Existing library gates retain broader state/interaction coverage.

The normal docs suite covers keyboard/focus, true static routes/search/404,
SSR/source/copy fidelity, hydration, responsive 320/390px layouts, configuration
and link round trips, malformed/bounded input, clipboard failure and state
preservation. Browser expectations follow installed package capabilities, so a
registry release must exercise editing just as an archive does. A candidate label
never substitutes for API availability.

## Hosted failure found during preparation

The [latest main deployment run](https://github.com/cognitap/radiant-docs/actions/runs/40247484931)
built successfully but failed at the router ref-focus assertion over HTTPS.
Normal replay passed; holding application scripts made the underlying gap
deterministic: the ref action was enabled in SSR before its handler existed.
`RouterLinkExample` now uses the existing hydration guard. Its copied source
includes the helper. `verify-action-hydration.mjs` holds scripts, requires a
disabled initial action, releases scripts and proves focus reaches the anchor.
The original remote markup fails that check; the fixed static build passes it.
The main deployment is not retroactively marked verified by this local fix.

The first PR preview passed build checks, then exposed the same missing-handler
interval in the Button counter after reload. The extended held-script regression
reproduced its enabled SSR action against that preview. The counter and custom
button/ref example now use the same guard, and both copied examples include the
helper. The regression checks all four local activation/ref actions before and
after scripts are released. Native links retain ordinary pre-hydration navigation.

## Publication order and remaining acceptance

1. Review and merge the small 0.0.4 library PR after required CI passes. The
   [existing release policy](https://github.com/cognitap/radiant/blob/22446b07767b2efff04796408fef4ed3872792a7/RELEASE_POLICY.md)
   requires version/notes in a PR and successful checks before merging main.
2. Dispatch **Release Radiant** on main with publishing selected. It prepares one
   archive, publishes that same archive with trusted publishing, then compares
   npm integrity with its receipt. Preserve the workflow URL/receipt. Retry a
   failed publish job against the original candidate; do not rebuild on retry.
3. Once 0.0.4 is registry-available, deliberately update the docs' exact manifest
   and lockfile pin. Update package-availability/setup text and remove the temporary
   compatibility seam where appropriate. Run the complete normal docs gate against
   the registry package; all workshop tests must run, rather than take 0.0.3's
   explicit unavailable path. Obtain and record the production visual review.
4. Merge the verified docs PR through the established Pages workflow. Verify its
   preview and final unique production URL using `pnpm test:deployment <origin>`
   from that exact revision; record `/deployment.json`, the registry version,
   source/setup parity and workflow/artifact links here and in DEV-160. A green
   build or successful upload without passing remote verification is insufficient.

The current docs dependency remains public 0.0.3. Its read-only inspection is
intentional until step 3. Library publication and public docs promotion have not
been performed by this preparation change. Do not close DEV-160 on the release
metadata merge alone.

## Limits

Evidence uses Chromium 156.0.8078.4 on macOS arm64 with system font fallbacks.
No manual VoiceOver, Safari/Firefox, broad device, actual custom-font loading,
chart distinguishability, Display P3 or stable-library readiness is claimed.
Font files and specimen input state are excluded from handoff. Typography and
motion remain starter controls for later chapters. Existing noindex and the
Cloudflare Pages delivery system remain in place. CI artifacts expire after
14 days; preserve launch evidence before expiry.
