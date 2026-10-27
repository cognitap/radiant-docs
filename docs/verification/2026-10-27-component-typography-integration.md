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
portable requirement/fallback. The CSS export also mirrors the installed ThemeScope UI Body family, size,
weight, leading and tracking when role tokens are available; released 0.0.4 keeps
its earlier wrapper rules. The actual installed handoff gate found a 3px total
height difference between typed and CSS wrappers before this correction. It now
compares weight, leading and tracking explicitly alongside dimensions, colors
and families, across full/partial exports, modes, scopes and both CSS routes.
No font files, dependencies or public package pin change.

Run the ordinary `pnpm check` against exact npm 0.0.4, and
`pnpm preview:candidate /absolute/path/to/radiant-dev167.tgz --check` against the
packed library adoption candidate. The complete candidate gate includes real
font loading/failure/retry/removal, full/selective handoff, all proof widths and
modes, scoped editor resets, installed styling routes and the brand matrix.
Raw verification receipts are under `output/docs` and `output/candidate/docs`.
DEV-169 retains ownership of publication and the public package pin.
