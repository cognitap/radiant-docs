# Hosting and deployment

The site uses **Cloudflare Pages Direct Upload** at the root of a generated
`*.pages.dev` origin. GitHub Actions builds and checks the standalone docs
repository, then uploads the exact tested `out/` artifact. There is no Next.js
server, Pages Function, Storybook checkout or library build on the host.

The generated production URL is returned by Cloudflare on the first production
deployment. Use the URL in the Actions environment/summary rather than assuming
the project name is available as a particular subdomain. No custom domain or
DNS change is part of this setup.

## Account setup

Configure these in **cognitap/radiant-docs**, under Settings → Secrets and
variables → Actions:

| Setting                    | Kind                | Value                                                         |
| -------------------------- | ------------------- | ------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`    | Repository variable | The selected Cloudflare account's 32-character ID             |
| `CLOUDFLARE_API_TOKEN`     | Repository secret   | Token with Account → Cloudflare Pages → Edit for that account |
| `CLOUDFLARE_PAGES_PROJECT` | Repository variable | `radiant-docs`, or another chosen project slug                |

Set the project variable last: its presence enables the deployment job. While
it is unset, builds, browser checks and downloadable site artifacts still run.
Do not paste the token into chat or commit it to this repository.

After setting these values, re-run CI on the open same-repository PR to create
the first hosted preview. Updating settings alone does not start a workflow.

The first deployment creates the named Direct Upload project if absent, with
`main` as its production branch. An existing project must have that branch and
no Git integration; the script refuses a conflicting setup. Cloudflare's own
Git integration is not enabled, avoiding a second build/deploy pipeline.
Direct Upload projects cannot later be converted to Git-integrated projects
in place; switching that model requires a separate Pages project.

See Cloudflare's [CI token/setup guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
and [Direct Upload reference](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Preview and production flow

```text
docs commit / pull request
  → pinned Node + pnpm, frozen lockfile
  → formatting, lint, types, deployment-target checks
  → static export + full local browser suite
  → docs-site artifact (the tested out/)
  → upload that artifact to Pages
  → verify its unique HTTPS deployment URL
  → deployment-results evidence
```

- Same-repository pull requests deploy to `pr-N` preview branches. Review the
  linked Preview environment and its checks before merging. Fork pull requests
  run the checks without receiving deployment credentials.
- A push to `main` deploys to production only after its checks pass. Merging a
  reviewed PR is the normal publication path. The production invocation is
  explicit and verifies that its revision is still current `origin/main`, so
  an older workflow cannot overwrite a newer source revision.
- Upload and verification jobs use the same immutable workflow artifact; the
  host does not rebuild it. `deploy:pages` rejects a dirty checkout, stale build,
  packed candidate or Radiant version absent from the public npm registry.
- Each deployment records its revision and documented Radiant version in
  `/deployment.json`. The verifier requires them to match its checkout and
  installed package before testing the website.

The deployment job's summary/environment supplies the unique preview or
production deployment link. On first setup, obtain a successful PR preview
before merging to launch production. A green build with the deployment job
skipped does **not** establish a published or verified website.

Cloudflare describes its [preview and production behavior](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

## Routes, assets and search

`next.config.mjs` keeps `output: 'export'` and `trailingSlash: true`.
The output includes directory indexes such as `docs/button/index.html`,
the generated `_next/` assets, `search-index.json`, `deployment.json` and
`404.html`. Upload all of `out/`, preserving paths.

The site expects an origin root, with **no base path**. Its links, search
index and example navigation use `/docs/...` and other root paths. Do not
mount this artifact under `/radiant-docs/` or configure an asset-only prefix.
Generated Pages preview/production origins satisfy this requirement.

Keep the top-level `404.html`. Pages uses it for missing routes; without it,
Pages can assume an SPA and serve the home page for unknown URLs. Do not add
a catch-all rewrite to `/index.html`. Search runs in the browser against the
static JSON index and needs no search API or environment secret. Keep Pages'
default caching rather than introducing a custom HTML cache rule.

See [Cloudflare's static serving behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Verify and retain evidence

Use the pinned Node 26.11.1 and pnpm 12.11.2:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
```

To verify a deployed origin, check out **that deployment's revision**, install
the frozen lockfile, then run:

```sh
pnpm test:deployment https://DEPLOYMENT.pages.dev
```

Use the actual URL from the deployment output. This runs the same suite over
HTTPS, including fresh deep links, generated assets, static search, true 404s,
JavaScript-disabled source, hydration, source/copy/reset and local demo actions.
The recipes cover native and TanStack owners in standalone/Card/Dialog placements.
Checks also cover the public preset registry and light/dark/system modes,
nested theme scopes, keyboard focus/activation/dismissal and 320/390px layouts.
Form saves are local preview state, not external submissions.

Before the suite starts, its metadata request waits up to three minutes for
initial edge DNS/TLS readiness or temporary 404/502/503/504 responses. A first
Pages project can finish uploading before its HTTPS endpoint is usable. The
check keeps normal certificate validation, fails immediately for permanent
errors such as 403, and still requires the exact deployment revision/package.
The browser assertions themselves are not retried by this readiness gate.

The hosted gate also holds JavaScript loading to verify that both form owners
keep fields and actions disabled until hydrated, then accept edits and save.
This prevents an early edit to SSR markup being lost when controlled form state
mounts on a slower connection.

`docs-results` contains local screenshots and `verification.json` with target,
revision, installed Radiant version, timestamps, exact Node/Chromium versions
and platform. `deployment-results` adds the deployed site's browser evidence
and Cloudflare deployment ID/URL. `docs-site` is the tested static export.
CI retains these artifacts for 14 days; preserve required launch evidence
before that retention window ends. A failing remote check fails the deployment
job and does not claim that the uploaded site is verified.

### Scope and known limitations

The site remains **experimental**, currently pinned to public Radiant 0.0.3.
Installation instructions, actual demo imports and displayed/copied files are
verified against that installed version. Packed local candidates retain their
separate visible label and are rejected by the publication script. The existing
experimental site's `noindex` metadata remains in place; making it searchable
by public search engines is a separate, deliberate site change.

Accessibility evidence consists of automated native roles/labels/descriptions,
keyboard actions, focus restoration and related browser assertions. This is
Chromium automation, not a complete accessibility certification. Actual
VoiceOver/screen-reader work and manual Safari/Firefox checks are not claimed.
Preset font stacks currently use system fallbacks on this website.

[DEV-57](https://linear.app/cognitap/issue/DEV-57) is Done. Its
[installed-consumer architecture checkpoint](https://github.com/cognitap/radiant/blob/23f0b8b05e2288da15b13c6d36f9583ea28a62ed/docs/verification/2026-10-25-installed-compositions.md)
records archive-based integration evidence and its historical registry limits;
it does not stand in for deployment verification of this website. The deferred
manual assistive-technology audit remains with DEV-83. Website launch does not
establish stable-library or complete-catalog readiness.

## Independent updates and rollback

Update public content/examples in this repository, open a PR, inspect its
verified preview, then merge for production. To adopt a new Radiant API, first
publish it through Radiant's existing release workflow, update the exact
`package.json` and lockfile pin here, and verify the docs. Website deployments
do not publish the library; library publication does not need to wait for docs.

For an immediate rollback:

1. Cancel any queued/in-progress production deployment runs so they cannot
   replace the rollback while it is being checked.
2. In Cloudflare → Workers & Pages → this project → Deployments, select a
   previous successful **production** deployment and choose **Rollback to this
   deployment**. Preview deployments are not rollback targets.
3. Check out that revision and run `pnpm test:deployment` against the production
   origin. Confirm `/deployment.json`, the visible version and the public flows.
4. Revert the faulty site commit in a new PR and merge the correction so
   source control and the production artifact agree again.

This changes the website and its documented package pin, not the npm release
or Storybook. Cloudflare documents [production rollback behavior](https://developers.cloudflare.com/pages/configuration/rollbacks/).
