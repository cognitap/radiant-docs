# Radiant documentation

## Documentation

Write for someone new to Radiant. Public pages lead with the example
and do not narrate the demo controls. Keep each fact in one place and link to it.
When behavior changes, rewrite the existing text; do not append. Use short,
plain sentences without ticket IDs, dates or disclaimers. Verification
evidence, research and test counts go in the pull request, never the repo.

`pnpm docs:check` enforces word budgets from `docs-policy.json`. Files under
`legacy` are pending cleanup: they may only shrink. Never add to `legacy` or
raise a budget; cut the text.
