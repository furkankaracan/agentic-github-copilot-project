---
name: triage-quality
description: "Triage lint, type and code-scanning findings into a grouped fix plan, then fix only the groups I approve."
agent: quality-fixer
---

Run Phase 1 of the `quality-remediation` skill on this repository: collect `npm run lint -- --format json` and `npm run typecheck` findings, group them by rule, and show me the plan table with a verdict per group.

Then stop and ask me which groups to fix. Do not edit anything until I answer.
