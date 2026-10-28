# Workshop font assets

Unmodified upstream fonts, self-hosted. All four families use SIL
OFL 1.1. Keep their complete adjacent licenses with redistributed copies:
`Inter-LICENSE.txt`, `Source-Serif-4-LICENSE.md`, `IBM-Plex-LICENSE.txt`.
Inter is v4.1; Source Serif 4 is 4.005R; IBM Plex is pinned to
`71f558992315a12ca1f06a2215d57962a1992162`.

`manifest.json` records exact upstream URLs and SHA-256 for all eight normal/
italic WOFF2 files and the separate Inter TTF test fixture. The workshop tests
verify those bytes. Fonts load only after opening Typography and selecting a
family. Matching normal and italic files are loaded together; the workshop
session caches at most the four curated families and removes its faces on reset
or unmount. No font CDN, local-font permission or installed-font enumeration is
used. The site serves these paths from its own origin.

The registry in `examples/workshop/workshop-fonts.ts` follows the
[accepted study](https://github.com/cognitap/radiant/blob/dd9a2270ba953adf0902d4bdb15f16a22eb236ed/docs/research/dev-162-font-research.md):
Inter weight 100–900/optical size 14–32; Source Serif weight 200–900/optical size
8–60; Plex Sans weight 100–700/width 85–100%; Plex Mono weight 100–700. Italic
uses separate files with matching ranges. Codepoint samples are observations,
not complete script or shaping certification.

When adapting the workshop source, copy the assets/licenses to your application's
public font directory and adjust its registry paths. Exported themes carry
family/weight/style requirements; they neither copy these assets nor load fonts.
