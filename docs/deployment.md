# Deployment

The site is a static export hosted on Cloudflare Pages with Direct Upload.
GitHub Actions builds and checks it, then uploads the tested `out/` folder.
Nothing is built on the host.

- Pull requests from this repository deploy a preview. Pull requests from forks
  run the checks without credentials.
- A push to `main` deploys to production after the checks pass, and only if it
  is still the latest `main`.
- The deploy script refuses a dirty checkout, a stale build, a local Radiant
  build, or a Radiant version that is not on npm.
- Each deployment serves `/deployment.json` with its commit and Radiant version.

The job summary links each deployment. A green build with the deploy job
skipped means nothing was published.

## Setup

In the repository's Actions settings:

| Name                       | Kind     | Value                                          |
| -------------------------- | -------- | ---------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`    | Variable | The Cloudflare account ID                      |
| `CLOUDFLARE_API_TOKEN`     | Secret   | A token with Cloudflare Pages edit permission  |
| `CLOUDFLARE_PAGES_PROJECT` | Variable | The Pages project name, such as `radiant-docs` |

Set the project variable last, because it turns deployment on. Then re-run CI on
an open pull request to get the first preview. The first deploy creates the
project with `main` as its production branch. Do not turn on Cloudflare's Git
integration.

## Hosting rules

- Serve the site at an origin root. Links and search use root paths such as
  `/docs/...`.
- Upload all of `out/`, including `404.html`. Without it, Pages serves the home
  page for unknown URLs. Do not add a catch-all rewrite.
- Search runs in the browser from `search-index.json`. It needs no server.

## Check a deployment

Check out the deployed commit, then run:

```sh
pnpm install --frozen-lockfile
pnpm test:deployment https://<deployment>.pages.dev
```

It first confirms that `/deployment.json` matches the checkout, waiting up to
three minutes for a new deployment to come up. Then it runs the full browser
suite over HTTPS.

## Roll back

1. Cancel any queued or running production deploys.
2. In Cloudflare, open the project's Deployments, pick an earlier production
   deployment and choose **Rollback to this deployment**.
3. Check out that commit and run `pnpm test:deployment` against production.
4. Revert the bad commit in a pull request, so `main` matches production again.

A rollback changes only the website, not the npm package.
