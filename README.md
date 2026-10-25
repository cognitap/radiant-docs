# Radiant documentation

Standalone documentation for [Radiant](https://github.com/cognitap/radiant), built
with Next.js static export, Fumadocs Core + MDX and Radiant UI. This is one app
with its own dependencies, lockfile and CI. A normal build requires no library
checkout, workspace link or source alias.

The initial site documents **Radiant 0.0.2**, pinned from npm. That release exports
Button; the newer components and theme APIs in the library repository will be
adopted as they ship. The installed version is displayed on every page. Site
layout uses semantic HTML while the live example uses the published Radiant
Button and compiled CSS. Fumadocs UI is not installed.

## Development

Use Node **26.11.1** and pnpm **12.11.2**. The versions are pinned in `.nvmrc` and
`package.json`; pnpm also manages the runtime. `pnpm-workspace.yaml` contains
single-app tooling/build settings and does not declare workspace packages.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3001](http://127.0.0.1:3001). Content lives in `content/docs`;
interactive examples live in `components`. The public Button route is
`/docs/button/`. Generated MDX and Next.js files are ignored.

## Build and verify

```sh
pnpm typecheck
pnpm build
pnpm preview
```

`out/` contains the static site. Preview serves actual files and directory
indexes, including direct page loads and a real 404 response. No Next.js server
is needed to host the output. Hosting and public deployment are tracked in
[DEV-141](https://linear.app/cognitap/issue/DEV-141).

For the complete local/CI gate:

```sh
pnpm exec playwright install chromium
pnpm check
```

This runs formatting, lint, typechecking, static build and browser smoke checks
for static HTML without JavaScript, navigation, direct-load hydration,
pointer/Enter/Space activation, the installed-version label, compiled CSS,
mobile overflow and 404s. Desktop/mobile screenshots go to `output/docs/` and
are uploaded by CI. On Linux, install Chromium with `--with-deps` as CI does.

`pnpm test:smoke` checks an already-built `out/`. Use `pnpm check` after changing
source so the output is rebuilt before checking it.

## Coordinate an unreleased library change

Normal builds consume the exact npm version in `package.json` and
`pnpm-lock.yaml`. Update those pins together when a new Radiant release is
available, then run `pnpm check`. The build validates the installed package
version rather than assuming the source repository matches npm.

For an explicit local preview, build and pack Radiant in its own checkout:

```sh
# In a Radiant library checkout:
pnpm build
pnpm pack --out /absolute/path/radiant-candidate.tgz

# In this documentation checkout:
pnpm preview:candidate /absolute/path/radiant-candidate.tgz
```

This copies the docs into an ignored temporary directory, installs the tarball
there, builds it and serves it at
[localhost:3002](http://127.0.0.1:3002). Each page shows the installed package
version and **Local candidate** filename, even if its version matches npm. The
maintained package manifest, lockfile and normal build output are untouched.
Stop the command to remove the temporary directory. Use
`pnpm preview:candidate /absolute/path/radiant-candidate.tgz --check` to run its
typecheck/build/browser checks and exit instead. `PORT` overrides the preview
port.

This opt-in path only changes the package consumed by the existing site. New
component adoption still requires an intentional docs change and a published
release before public deployment.

## Repository ownership

- **Radiant:** components, tokens, supported presets (including Sharp and
  Jelly), Storybook, story interactions and canonical recipe source.
- **This repository:** MDX pages, navigation/search, demo presentation,
  integration checks and independent site delivery.

Shared examples will cross this boundary through pinned versioned artifacts
from the library: [DEV-148](https://linear.app/cognitap/issue/DEV-148) produces
them and [DEV-149](https://linear.app/cognitap/issue/DEV-149) consumes them. The
reusable demo frame is [DEV-138](https://linear.app/cognitap/issue/DEV-138).
Storybook and presets remain in Radiant; recipes are not copied here.

This repository replaces the in-library `apps/docs` prototype from
[Radiant PR #39](https://github.com/cognitap/radiant/pull/39), closed without
merging. The library's package and CI are unchanged by this setup.
