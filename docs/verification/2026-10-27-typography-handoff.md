# Typography handoff (DEV-168)

The handoff now offers full-theme and Typography-only TypeScript/CSS, plus
portable setup requirements. Typography stays in the native document/compiler;
the website presents and copies its supported outputs.

`applyTypography(target, mode = 'replace')` imports only the typography section
through `updateThemeDocument`. Color, control metrics, surfaces/spacing, motion,
component exceptions and target identity remain owned by the destination.
The typography CSS wrapper declares only `--rad-typography-*` and its text
metrics, without painting a canvas or changing color-scheme. It inherits the
rest of the application theme; use the typed route for nested ThemeScope modes.

Font requirements retain requested family/weight/style and available axes in
native metadata. Curated entries link the pinned normal/italic files and license;
setup CSS deduplicates faces and includes variable weight/width descriptors.
Local files/private filenames/blob URLs remain browser-owned. Missing files
retain exact family/weight/style/axis requirements and instructions to supply a
licensed file or restore it in Typeface lab with the same family. Axis ranges
are available capabilities; trial-only variations are not applied to the theme.
The older 0.0.4 path keeps its supported metadata; the native parser capability
probe avoids pretending that it can persist the new axis field.

Verification seams:

- Pure full/selective round trips, safe setup comments, known file/license/range
  descriptors, duplicate-face prevention and local-file/unknown-axis handling.
- Browser clipboard copies of typography TypeScript/CSS and font setup, keyboard
  activation/focus, JSON import/share reload and the existing real-file lifecycle.
- The isolated installed consumer compiles the actual exported partial TypeScript
  and compares it with the actual partial CSS under an existing theme. It checks
  text metrics, all ten families, control/component exceptions and inherited
  colors/motion across light/dark/system and compiled/Tailwind with/without reset.
  A typography-only wrapper inherits the painted canvas rather than painting a
  second background; the comparison deliberately excludes only that root paint.
- Full workshop checks retain existing full/partial handoff, private form state,
  failure/clipboard fallback, source-copy, responsive proofs and brand checks.

The library prerequisite is Radiant PR #57, prepared unpublished 0.0.5. DEV-169
is stacked on this docs branch and owns recorded chapter specimens, publication,
registry-integrity confirmation and exact public pin promotion. No manual
browser/AT or universal font/script quality certification is implied.
