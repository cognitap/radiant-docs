# Radiant documentation

## Documentation

Write for a person reading Radiant for the first time. Each fact lives in one
place; link to it instead of restating it.

- `content/docs/`: public pages. Lead with the example, then say when to use
  the component and what to watch for. Do not describe what each button in a
  demo does; the demo shows that.
- `README.md`: what this repository is and how to run, verify and extend it.
- `docs/`: maintainer guides, such as deployment.
- Pull request description: verification evidence, test counts, screenshots,
  environment details and anything else about how the work was done.

When behavior changes, edit the existing text so it describes the current
state. Delete what is no longer true. Do not append a section per change.

Use short, plain sentences. Say what something does and why. Leave out ticket
IDs, dates, commit hashes and disclaimers about what was not tested.

`pnpm docs:check` enforces word budgets, the ban on ticket IDs, and the ban on
`docs/verification/` and `docs/research/`. Rules and budgets live in
`docs-policy.json`. Its baseline lists older files that break the rules. Those
files may shrink but not grow. Never add entries to the baseline or raise a
budget to pass the check: cut the text. After fixing a file, run
`node scripts/check-docs.mjs --prune`.
