# Font verification fixture

`InterVariable.ttf` is the unmodified Inter v4.1 Roman variable font from
https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/InterVariable.ttf.
Its SHA-256 is recorded in `public/fonts/workshop/manifest.json`; the complete
[Inter license](../../public/fonts/workshop/Inter-LICENSE.txt) accompanies it.
It is a test fixture, outside the static site's public assets. The browser tests
choose it as a private local file to verify actual OpenType metadata, variable
font loading and export privacy without making tests depend on upstream servers.
