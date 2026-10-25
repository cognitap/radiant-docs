# Radiant documentation

Standalone documentation for [Radiant](https://github.com/cognitap/radiant), built
with Next.js static export, Fumadocs Core + MDX and Radiant UI. This is one app
with its own dependencies, lockfile and CI. A normal build requires no library
checkout, workspace link or source alias.

The site consumes **Radiant 0.0.3**, pinned from npm. That experimental release
exports the harmonised ten-family component system and shared theme APIs. This
site includes guides for all ten families, installation/foundations/release
guidance and complete native/TanStack profile-form recipes. Broader setup and
theming guidance remains separate work. The installed version is displayed on
every page. Site layout uses semantic HTML while live examples use
published Radiant components, presets and compiled CSS.
Fumadocs UI is not installed.

## Development

Use Node **26.11.1** and pnpm **12.11.2**. The versions are pinned in `.nvmrc` and
`package.json`; pnpm also manages the runtime. `pnpm-workspace.yaml` contains
single-app tooling/build settings and does not declare workspace packages.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3001](http://127.0.0.1:3001). Content lives in `content/docs`;
interactive examples live in `examples`. Public routes include `/docs/button/`,
`/docs/link/`, `/docs/field/`, `/docs/input/`, `/docs/checkbox/`, `/docs/radio-group/`,
`/docs/dialog/`, `/docs/collapsible/`, `/docs/accordion/`, `/docs/card/` and
`/docs/recipes/profile-form/`. Generated MDX and Next.js files are ignored.

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
pointer/Enter/Space activation, independent controls/reset, keyboard source
disclosure, real highlighted/copied source (including supporting files), clipboard
failure feedback, the installed-version label, compiled CSS, mobile overflow and
404s. Recipe checks exercise both owners in all three placements, validation and
reset, keyboard radio/checkbox changes, local save feedback, Dialog dismissal and
focus restoration, instance/ID isolation and all eight presets in light/dark.
Action checks verify the released variants/tones/sizes, theme/mode selection,
pending activation guards and reduced-motion labels, custom button/ref forwarding,
native and Next.js navigation (including modified clicks, middle clicks and new
tabs), and source/copy integrity. Site link/focus styles exclude Radiant hosts so
the examples retain their own presentation.
Form-control checks cover label/help/error relationships, a native Field adapter,
required/disabled/read-only state, real FormData payloads, mixed checkboxes, native
radio keyboard/reset behavior and isolation from embedded profile recipes.
Composition checks cover native Dialog focus/dismissal and Button adapters,
top-layer themes, controlled/uncontrolled disclosures, Accordion selection and
disabled guards, passive Card actions and embedded form ownership.
Desktop/mobile screenshots go to `output/docs/` and
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
  Jelly), and Storybook for component development and regression checks.
- **This repository:** MDX pages, navigation/search, independently authored
  public demos and recipes, integration checks and site delivery.

The website consumes the published package as another application. It does not
import Storybook source or an examples artifact. Public recipes explain how to
use Radiant; Storybook can exercise development cases without mirroring them.

## Add an interactive example

```text
content/docs/button.mdx
  → components/ButtonDemo.tsx       server: lists the actual example files
    → demo/Demo                    reads and highlights files at build time
    → examples/button/ButtonPlayground.tsx
      → DemoControls               labeled controls, local React state
      → DemoPreview
        → ButtonExample.tsx        actual component imported by the preview
          → button-example.css     supporting source shown alongside it
```

1. Put the copyable component and its local supporting files under `examples/`.
   Keep website controls in a separate `*Playground.tsx` client component.
2. In a server component, compose `Demo` with a title, `files` relative to
   `examples/`, and the playground as its children. List the exact files imported
   by the preview, plus its supporting TS/TSX, CSS or JSON files. Source is read
   verbatim; there is no separately maintained snippet. All listed files appear
   inside the source disclosure and each has its own copy button.
3. Use `DemoControls` and `DemoPreview` inside the playground. Both accept children
   and an accessible `label`. The frame remounts this subtree on reset, restoring
   both control defaults and component state while retaining source disclosure
   and toolbar focus. Keep state local; multiple instances are independent.
4. For a theme/mode control, put its labeled selector in `DemoControls`
   and compose the installed release's `ThemeScope` inside `DemoPreview`.
   Preset implementations stay in the library. Button, Link and profile previews
   offer all published presets and light/dark/system modes. The broader setup
   and theming guides belong to [DEV-145](https://linear.app/cognitap/issue/DEV-145).
5. Use `next/dynamic` in the client playground for separately loaded example
   modules, retaining SSR so direct loads have real HTML. Highlighting and file
   reads stay on the server. Browser checks stay under `scripts/`, outside the
   production bundle. Call behavior checks from `scripts/verify-docs.mjs`.

## Public action examples

`examples/button/` and `examples/link/` contain the independently authored
examples for [DEV-142](https://linear.app/cognitap/issue/DEV-142). The basic Button
and Link examples require React and Radiant only. `ButtonComposition` forwards
resolved props/ref/children to one native button. `RouterLinkExample` additionally
uses the website's pinned Next.js `next/link` adapter and keeps native anchor
responsibilities. The guides describe native host semantics, accessible naming,
released props and dependency requirements.

The playgrounds own focused controls separately from the displayed/copied
components. Each copyable component accepts a theme/mode; changing those keeps
local state. Reset remounts the preview and controls. No library Storybook source
or development-state matrix is imported. `scripts/verify-actions.mjs` runs with
the existing website gate against the exact installed package.

## Public profile recipes

`examples/profile/` contains the website-owned recipe delivered in
[DEV-137](https://linear.app/cognitap/issue/DEV-137). Its page explains setup,
ownership and placement choices. The native version uses uncontrolled controls
and `FormData`; the optional TanStack version uses controlled field bindings.
`ProfileRecipe` composes either version with standalone, Card or Dialog layouts
and the installed library's `ThemeScope`/presets. Website option controls live in
`ProfilePlayground`, outside the copyable recipe.

Both form versions, the shared validators/defaults, hydration helper, composition and CSS
are displayed from the same files the preview imports. The website playground
loads the recipe through `next/dynamic` with SSR; the copyable recipe uses plain
React and has no Next.js dependency. TanStack Form 1.33.5 is a dependency of this
website only; Radiant's runtime dependencies are unaffected. Native-only consumers can use
`NativeProfileForm` and its callbacks directly without TanStack.

Save feedback is local to each preview; no API request or persistence is implied.
Form reset clears values, validation and saved feedback. Dismissing a Dialog
retains unsaved edits until reset. Owner/placement changes start a fresh example;
theme/mode changes preserve it. The frame's reset also restores option defaults.
`scripts/verify-profile-recipes.mjs` runs through the normal smoke-check gate;
it is not imported by production code.

## Form control guides

The Field, Input, Checkbox and RadioGroup pages document Radiant 0.0.3's native
hosts, parts, props and consumer responsibilities. `examples/controls/` owns
five focused examples: Field relationships with a native-input adapter, email
validation/read-only behavior, checkbox payloads, controlled mixed selection,
and native radio grouping/reset. `ControlPlayground` owns website options;
`components/ControlDemo.tsx` lists the actual preview and supporting files.

Copyable examples use React and public Radiant exports only. They share
`control-types.ts`, `control-example.css` and the existing
`profile/useHydrated.ts`. Preserve the displayed `controls/` and `profile/`
paths when copying so relative imports resolve. The helper disables submit until
JavaScript handlers are ready; static HTML still includes controls and source.
Validation, saved feedback and controlled reset remain explicit in each example.

Field and RadioGroup also embed the existing `ProfileFormDemo`, starting with
native/standalone and TanStack/Card respectively. These are the same recipe
modules and source files as the recipe page, with no duplicate form implementation.
Readers can choose every owner/placement there. The component guides link to the
recipe's setup and optional TanStack dependency instructions.

`scripts/verify-controls.mjs` runs in the normal gate. CI saves desktop/mobile
`controls-*.png` screenshots alongside recipe and navigation evidence.

## Surface and disclosure guides

Dialog, Collapsible, Accordion and Card use independently authored examples in
`examples/compositions/`. The guides document named parts, public props, native
hosts and style/ref targets against Radiant 0.0.3. `CompositionPlayground` keeps
website options outside copyable components; `components/CompositionDemo.tsx`
lists their exact source and supporting files. Preserve the displayed directory
paths when copying shared types, CSS and the existing hydration helper.

Dialog demonstrates a native Button render/ref adapter, modal/nonmodal behavior
and dismissal policy. Collapsible shows local and controlled ownership while
retaining a draft. Accordion supports single/multiple selection and disabled
items; changing its type/owner remounts the preview. Card's explicit Button/Link
actions leave the surface passive. Compact uses public local theme tokens;
theme/mode changes retain example state.

Dialog and Card reuse `ProfileFormDemo`. Its optional `placement` sets the
embedding's initial placement and is restored by frame reset; existing callers
keep their original defaults. The Dialog guide starts native/Dialog, while Card
starts TanStack/Card. The recipe/form implementations and displayed source are
shared with the recipe and form-control pages.

Basic native details and links work without JavaScript. Dialog opening,
coordinated selection, disabled guards and local action feedback require it;
the guides distinguish those responsibilities explicitly. The compiled stylesheet
preserves functional hiding, sizing, scrolling and focus presentation.

`scripts/verify-compositions.mjs` runs through the normal gate and saves
`composition-*.png` screenshots, including an open narrow Dialog and dark mode.

## Navigation and search

The documentation shell has five sections: Getting started, Foundations,
Components, Recipes and Releases. `lib/navigation.ts` derives links and titles
from the Fumadocs source loader. A page whose first slug matches a section goes
there; other pages (including the existing `/docs/button/`) go under Components.
Add MDX under `content/docs/` to make it available to navigation and search.
There is no second list of page links to maintain.

The desktop sidebar and mobile Radiant Dialog share the same navigation model.
Active links follow the current pathname. Fumadocs' generated `toc` supplies the
page outline and active-heading tracking; only authored content headings appear
there, so embedded demo headings do not pollute it. The skip link targets the
page's focusable main content after the sidebar.

`app/search-index.json/route.ts` exports Fumadocs Core's advanced search index at
build time. Static hosting must serve `/search-index.json` as an ordinary JSON
asset; there is no runtime search API or external search service. The search
panel/engine load on demand, download and cache the index, and run subsequent
queries in the browser. Results include content-derived page/heading anchors.
An index failure offers Retry search with a fresh download URL.

Search uses released Radiant Dialog, Field, Input, Button and Link components,
with native links for results. Tab, arrows and Enter reach/open results; Escape
dismisses the dialog. Ctrl/Cmd+K opens search unless focus is in an editable
control or another dialog is open, preserving the interactive examples.

The site uses Radiant `ThemeScope` with light/dark/system appearance. Selection
survives client-side navigation; a fresh load defaults to the operating system.
Recipe previews keep their explicit theme/mode. MDX typography, syntax colors,
scrollable tables and callouts stay scoped to documentation presentation.
`scripts/verify-navigation.mjs` covers exported links/index, search results and
retry, navigation/outline/skip focus, appearance and narrow layouts through the
normal browser gate. CI also saves `navigation-*.png` and `search-*.png`.

This repository replaces the in-library `apps/docs` prototype from
[Radiant PR #39](https://github.com/cognitap/radiant/pull/39), closed without
merging. The library's package and CI are unchanged by this setup.
