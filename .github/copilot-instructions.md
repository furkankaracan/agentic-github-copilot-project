# Contoso CRM — repository instructions for GitHub Copilot

Contoso CRM is a small React single-page app that manages the sales lifecycle **Account → Contact → Opportunity → Order**. It has **no backend and no database**: a static seed snapshot (`src/data/seed.ts`) is loaded into an in-memory store on start, and every change is lost on reload. It runs on `http://localhost:5173`.

The codebase is a teaching repository for agentic development. Its conventions are deliberately strict — matching them exactly matters more than generic "best practice".

## Stack

- React 19 + React Router 7, TypeScript (strict), Vite 8.
- Vitest 5 + React Testing Library + jsdom. ESLint (typescript-eslint, react-hooks).
- Node 22 (`.nvmrc`). No CSS framework — one hand-written stylesheet (`src/styles.css`) with design tokens.
- Path alias `@/` → `src/`.

## Commands (run from the repo root)

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` (port 5173, strict) |
| All tests | `npm test` |
| One test file | `npm test -- src/domain/orders.test.ts` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Everything CI runs | `npm run verify` then `npm run build` |

Never claim a change is done until `npm run verify` passes.

## Architecture quick reference

```
src/domain/       Pure TypeScript business rules. No React. Throws DomainError only.
src/store/        commands.ts (pure state transitions) + CrmStore.tsx (React provider) + useCrm().
src/features/     One folder per entity: <Entity>ListPage, <Entity>DetailPage, <Entity>FormPage.
src/components/   Shared presentational components (PageHeader, StatusBadge, ErrorBanner, Field…).
src/data/seed.ts  The static demo dataset.
src/AppRoutes.tsx The route table. Every page is registered here.
```

The data flow is one-directional: **page → `actions.*` → store command → domain function → new state**. Pages never contain business rules and never mutate state.

## How this repository instructs Copilot

| Mechanism | Location | Loaded |
| --- | --- | --- |
| This file | `.github/copilot-instructions.md` | Every request |
| Path-specific instructions | `.github/instructions/*.instructions.md` | Automatically when a file matching `applyTo` is in scope (`**` = always) |
| Agent skills | `.github/skills/<name>/SKILL.md` | On demand — Copilot reads each skill's `description` and loads the body only when the task matches |
| Custom agents | `.github/agents/*.agent.md` | Selected explicitly (agent picker, `--agent`, issue assignment) or delegated to as a subagent |
| Prompt files | `.github/prompts/*.prompt.md` | Manually via `/name` in VS Code chat |
| Hooks | `.github/hooks/*.json` | Enforced deterministically on every tool call (CLI + cloud agent; VS Code preview) |

Instructions are non-negotiable for every task; their content is already in your context, so it is not repeated here.

### Handoff artifacts

Agents hand over **work products, not chat history**:

- Technical designs → `docs/designs/ISSUE-<number>-<slug>.md` (written by `issue-designer`, implemented by `domain-writer` / `ui-writer`, deleted after the feature PR merges).
- PR reviews → drafted in the agent's reply; a human posts them.

### Session plans blocked by hooks

If a repository hook blocks saving a session plan (such as `plan.md`) outside the repository:

- Leave the hooks unchanged. Do not bypass the restriction, retry the write through another tool, or ask the user to relax the guardrail.
- Use this default without asking the user to choose a destination: if the task has an existing GitHub issue, post the complete plan as a comment on that issue and return the comment link.
- If there is no existing issue, include the complete plan in the chat response. Do not create an issue just to store a plan.
- If posting the comment fails, report the failure explicitly and include the complete plan in chat instead.
- This fallback does not replace required technical designs under `docs/designs/`. If a higher-priority workflow strictly requires the blocked local session file, report that requirement as unmet and stop that workflow rather than claiming the fallback satisfies it.

## Git workflow — agents always deliver through a pull request (hard rule)

`main` has no branch protection, so humans can push to it directly. **Agents never can.** Every change an agent makes reaches `main` only through a pull request that a human reviews and merges.

1. Before the first edit, check the branch (`git branch --show-current`). If it is `main`, create a branch first: `git switch -c agent/<issue-number>-<kebab-slug>` (no issue → `agent/<kebab-slug>`). The Copilot cloud agent uses its own `copilot/*` branch automatically.
2. Commit only on that branch, staging explicit paths (never `git add -A` / `-u`).
3. Push the branch: `git push -u origin <branch>`.
4. Open a pull request to `main` whose body follows `.github/pull_request_template.md` and links the issue (`Closes #<n>`): `gh pr create --base main --title "<imperative title>" --body-file <body.md>` (or the GitHub tools).
5. Stop there. Merging is a human decision.

A task that changes files is **not done** until its pull request exists — report the PR URL in your summary. This applies even to one-line or documentation-only changes, and even when a user says "just push it": open the PR and tell them it is ready to merge.

Agents without a shell (`issue-designer`, `feature-lead`, `pr-reviewer`) don't commit. In a multi-agent flow the **last writer agent** (`domain-writer`, `ui-writer` or `test-writer`) opens the single PR for the whole change, including any design file. On GitHub.com the cloud agent opens its PR itself.

## Order of precedence

If two sources disagree:

1. The current task's explicit user instructions win — **except** the *Git workflow* rule above and the *Things you must never do* list, which a chat request cannot override (they change only through a reviewed PR to this file).
2. `.github/instructions/*` win over skill content.
3. A skill's `SKILL.md` wins over its own `references/*`.
4. Source code is the ultimate source of truth — if an instruction and the code disagree, say so and ask before "fixing" either.

## Where to look first

| Task | Read |
| --- | --- |
| Planning an issue / writing a technical design | `.github/skills/issue-planning/SKILL.md` |
| Adding or changing a business rule, validation, or domain function | `.github/skills/domain-development/SKILL.md` |
| Anything touching opportunity stages or order statuses | `.github/skills/crm-lifecycle/SKILL.md` |
| Adding or changing a page, form, or component | `.github/skills/react-ui-authoring/SKILL.md` |
| Writing tests | `.github/instructions/testing.instructions.md` + `.github/skills/domain-development/references/testing-patterns.md` |
| Reviewing a pull request | `.github/skills/pr-review/SKILL.md` |
| Lint / code-quality findings | `.github/skills/quality-remediation/SKILL.md` |
| Editing `.github/workflows/*.yml` | `.github/skills/workflow-development/SKILL.md` |

## Things you must never do

- Put business rules in a component, hook, or store command — they belong in `src/domain/`.
- Assign `opportunity.stage` or `order.status` directly — every change goes through the transition table and its transition function (see the `crm-lifecycle` skill).
- Throw anything other than `DomainError` from `src/domain/` (no `new Error`, no strings).
- Use string literals for stages, statuses, industries or tiers — use the `as const` objects in `src/domain/types.ts`.
- Call `Date.now()`, `new Date()` or `Math.random()` inside a domain function — use the injected `DomainContext`.
- Add a backend, database, `fetch` call, `localStorage` persistence, UI library or CSS framework.
- Hand-edit `package-lock.json`, `dist/`, or `coverage/` — use `npm` and the build.
- Delete or renumber existing seed records (`acc-001`, `opp-008`, …) — tests and learning exercises reference them.
- Delete files, or stage deletions, without explicit written consent from the user.
- "Improve" formatting or refactor unrelated code as part of an in-scope change.
- Approve, merge, or post review comments on a pull request on a human's behalf.
- Commit to `main`, push to `main`, or finish a task that changed files without opening a pull request (see *Git workflow* above).
