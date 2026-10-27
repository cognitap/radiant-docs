# Radiant documentation

## Documentation

Write for someone new to Radiant. Public pages lead with the example
and do not narrate the demo controls. Keep each fact in one place and link to it.
When behavior changes, rewrite the existing text; do not append. Use short,
plain sentences without ticket IDs, dates or disclaimers. Verification
evidence, research and test counts go in the pull request, never the repo.

`pnpm docs:check` enforces the word budgets in `docs-policy.json`. When a file
is over budget, cut text. Never raise a budget or add a `legacy` entry.

Where things go:

- A component fact lives on that component's page; other pages link to it.
- Never write a Radiant version on a page. Every page shows the installed
  version, and `@cognitap/radiant` install commands are unpinned.
- `README.md` covers development only, and `docs/deployment.md` is the runbook.
