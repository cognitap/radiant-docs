# Radiant documentation

The documentation site for [Radiant](https://github.com/cognitap/radiant), live at
<https://radiant-docs.pages.dev>.
It is a static Next.js export built with Fumadocs, and its live examples use the
published `@cognitap/radiant` package pinned in `package.json`.

Radiant owns components, tokens, presets and Storybook. This repository owns the
pages, navigation, search, public examples, the theme workshop and site delivery.

## Run it

Use the Node and pnpm versions pinned in `.nvmrc` and `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The site runs at [localhost:3001](http://127.0.0.1:3001).

## Verify it

```sh
pnpm exec playwright install chromium   # add --with-deps on Linux
pnpm check
```

`pnpm check` runs formatting, lint, the docs word check, types, the Node tests,
the static build and the site tests. A failed page check saves a screenshot
under `output/docs/`. `pnpm preview` serves the built `out/` folder.
`pnpm test:deployment https://<deployment>` runs those site tests against a
deployed origin and waits until that origin answers.

## Add a page

Add an MDX file under `content/docs/`. Navigation and search pick it up; there
is no separate list of links. A page whose first slug matches a section
(`foundations`, `recipes` and so on) goes in that section, and other pages go
under Components.

## Add an example

```text
content/docs/button.mdx
  → components/ButtonDemo.tsx            lists the example files
    → examples/button/ButtonPlayground.tsx   controls and preview
      → examples/button/ButtonExample.tsx    the code readers copy
```

1. Put the copyable example and its CSS under `examples/`. Keep site controls in
   a separate `*Playground.tsx` client component.
2. In a server component, wrap the playground in `Demo` and list every file the
   example imports. The source panel shows those files as they are.
3. Inside the playground, use `DemoControls` and `DemoPreview`. Reset remounts
   them, so keep state local.
4. The page check already covers a new doc page. Add a case in
   `tests/site/demos.test.ts` only when the example has its own site wiring.

## Try an unreleased Radiant build

To draft pages against a Radiant branch:

```sh
pnpm preview:local ../radiant   # builds that checkout, serves at localhost:3001
```

Pages reload as you edit them. Rerun the command to pick up Radiant changes.
Stopping it puts the published package back. `pnpm docs:check` fails if a
local Radiant reference reaches `package.json`, the workspace or the lockfile.

To check a packed candidate as CI would:

```sh
# In the radiant checkout
pnpm build && pnpm pack --out /tmp/radiant.tgz
# Here
pnpm preview:candidate /tmp/radiant.tgz          # serves at localhost:3002
pnpm preview:candidate /tmp/radiant.tgz --check  # runs the checks instead
```

This installs the build in a temporary copy, so `package.json` and the lockfile
are untouched. To adopt a new release, update the pin in `package.json` and the
lockfile together, then run `pnpm check`.

## Deploy

See [deployment](docs/deployment.md).
