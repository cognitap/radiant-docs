# Component typography integration (DEV-167)

The library candidate adopts UI roles in production components. The typeface lab
already assigns its chosen family to the selected Body/Headings/UI/Code context;
it also retains a legacy shared-family value for compatibility with released
0.0.4. A font-trial browser assertion previously inspected the whole canvas after
a Code assignment, accidentally depending on the legacy value overriding UI.

The verifier now inspects the actual Code proof when the typesetting editor is
available, and retains the whole-canvas assertion for the older released editor.
It also checks that exporting a local Code assignment preserves the independent
Inter UI assignment. Font removal still releases owned faces and retains the
portable requirement/fallback. No editor behavior, font files, dependency or
public package pin changes.

Run the ordinary `pnpm check` against exact npm 0.0.4, and
`pnpm preview:candidate /absolute/path/to/radiant-dev167.tgz --check` against the
packed library adoption candidate. The complete candidate gate includes real
font loading/failure/retry/removal, full/selective handoff, all proof widths and
modes, scoped editor resets, installed styling routes and the brand matrix.
Raw verification receipts are under `output/docs` and `output/candidate/docs`.
DEV-169 retains ownership of publication and the public package pin.
