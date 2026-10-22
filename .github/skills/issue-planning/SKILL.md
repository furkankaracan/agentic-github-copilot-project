---
name: issue-planning
description: "Turn a GitHub issue (feature, bug, or chore) for Contoso CRM into a technical design file under docs/designs/ that implementation agents build from. Covers reading the issue and its comments, clarifying open questions, auditing the existing code, splitting the work into domain / UI / test packages, and writing the design with acceptance-criteria traceability. Use when asked to plan, design, analyse, scope, or break down an issue or user story."
---

# Issue planning — Contoso CRM

You turn an issue into **one design file**, `docs/designs/ISSUE-<number>-<kebab-slug>.md`. Whoever implements it has only that file, not your conversation — write it so a teammate can pick it up cold.

You never edit source code while planning. The design file is your only output.

## Phase 1 — Understand the issue

1. Read the issue: title, body, acceptance criteria, labels, every comment, linked issues. Use the GitHub MCP tools (`issue_read`, `list_issues`, `search_issues`) or `gh issue view <n> --comments`.
2. List every point that is vague, contradictory or missing (e.g. "what happens to existing records?", "who can do this?").
3. **Ask before you plan.** In an interactive session, ask the human each open point now (several rounds are fine). On GitHub.com (cloud agent) nobody can answer — record each point under *Open questions* with the assumption you chose and why.

## Phase 2 — Audit the code

Ground every statement in what exists — don't design from memory:

- Which types, domain functions, commands, actions, pages and tests touch the same entity? (`grep` in `src/domain`, `src/store`, `src/features`.)
- Does a skill already specify the behaviour? **Always** check `crm-lifecycle` for anything involving stages or statuses — the spec there wins over the issue text unless the issue explicitly changes it.
- Which seed records demonstrate the change? (Use real ids like `opp-008`.)
- Is there existing behaviour that contradicts the issue or the spec? That's a finding — call it out.

## Phase 3 — Split the work

Classify every requirement into exactly one package (see [references/work-types.md](references/work-types.md)):

| Package | Owner agent | Scope |
| --- | --- | --- |
| **Domain** | `domain-writer` | `src/domain/**`, `src/store/**`, `src/data/seed.ts`, their tests |
| **UI** | `ui-writer` | `src/features/**`, `src/components/**`, `src/AppRoutes.tsx`, `src/styles.css`, UI tests |
| **Tests only** | `test-writer` | New tests for existing behaviour |

If a requirement spans packages, split it and note the dependency ("UI 2 needs Domain 1's `moveOrder` action").

## Phase 4 — Write the design

Use the template in [references/design-template.md](references/design-template.md) verbatim (headings in the same order). Every acceptance criterion must map to at least one work item and one test.

## Wrap-up

Reply with: the file path, the breakdown table, and the open questions — so the lead can review without opening the file. Do not start implementation.
