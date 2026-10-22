---
name: quality-remediation
description: "Two-phase workflow for triaging and fixing code-quality findings in Contoso CRM — ESLint warnings/errors, TypeScript errors, and GitHub code scanning alerts: read-only fetch and grouped fix plan, explicit human approval, then apply only the approved groups test-first and re-verify. Use when asked to triage, review, clean up, or fix lint warnings, code-quality findings, or code scanning alerts."
---

# Quality remediation (two hard-separated phases)

Never collapse the phases. Phase 1 always ends in a pause for approval.

## Phase 1 — Find & plan (read-only)

1. Collect findings:
   - `npm run lint -- --format json` (or `npx eslint . -f json`) — parse rule id, file, line, severity.
   - `npm run typecheck` — TypeScript errors.
   - Code scanning alerts, if the GitHub MCP server exposes them (`code_security` toolset) — read-only.
2. Drop findings in generated or vendored paths (`dist/`, `coverage/`, `node_modules/`). List them as *excluded*.
3. **Group by rule**, then by file. For each group produce one row:

| Group | Rule | Files (count) | Why it matters here | Proposed fix | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | `no-console` | 1 | Debug output leaks to users' consoles | Remove the statement | Low | Fix |
| G2 | `@typescript-eslint/no-explicit-any` | 2 | Hides type errors in domain inputs | Replace with the real type / `unknown` + narrowing | Medium | Fix |
| G3 | `react-refresh/only-export-components` | 1 | Dev-only HMR warning | Accept — move only if file is touched anyway | — | Won't fix |

Verdict is one of **Fix**, **Won't fix (reason)**, **False positive (reason)**.

4. **Stop.** Ask: "Which groups should I fix?" In the cloud agent (no human available), Phase 1 output is the deliverable — write it into the PR description and make no code changes unless the issue lists approved groups.

## Phase 2 — Apply approved groups only

For each approved group, in order:

1. If the fix changes behaviour, write the failing test first (see `testing.instructions.md`).
2. Touch only the flagged lines. Adjacent smells → *Observations*, not fixes.
3. Never silence a rule with `eslint-disable` or `@ts-ignore` unless the human approved that exact suppression.
4. Re-run `npm run verify`; the group's findings must be gone and nothing new introduced.

## Phase 3 — Report & self-audit

- Table: group → files changed → findings before/after.
- `npm run verify` output summary.
- Anything in these instructions that was wrong or missing while you worked (so a human can improve this skill).
