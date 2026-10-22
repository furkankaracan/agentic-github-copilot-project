# Live demo runbook

Agenda focus: **02 Anatomy of `.github/`**, **03 Foundational mechanics**, **04 Custom agents & security**.
The app runs locally on `http://localhost:5173`; the backlog is in GitHub Issues.

## Backlog at a glance

| # | Issue | Best demo agent | Surface |
| --- | --- | --- | --- |
| 1 | Order lifecycle: submit, fulfil, invoice, cancel | `issue-designer` → `domain-writer` → `ui-writer` | VS Code (handoffs) |
| 2 | Require a loss reason when marking lost | `feature-lead` (`/deliver-issue 2`) | VS Code (subagents) |
| 3 | Weighted pipeline forecast | `domain-writer` | any |
| 4 | Edit account details | `ui-writer` + `domain-writer` | any |
| 5 | Delete an account (guarded) | `issue-designer` (shows deletion-consent rules) | any |
| 6 | Search and filter contacts | default cloud agent | GitHub.com |
| 7 | Contact detail page with edit | `issue-designer` | any |
| 8 | Manage order lines on draft orders | after #1 | any |
| 9 | Unit tests for contacts module | `test-writer` | GitHub.com |
| 10 | Clean up ESLint warnings | `quality-fixer` (`/triage-quality`) | VS Code / GitHub.com |
| 11 | Filter opportunities by stage | `ui-writer` | GitHub.com |
| 12 | **Bug:** open pipeline includes lost deals | `domain-writer` | GitHub.com |

## T-1 day

- [ ] `npm ci`, `npm run verify`, `npm run test:hooks` green.
- [ ] Repo settings: Copilot cloud agent enabled; branch ruleset on `main` (PR required, Code Owners review, `CI` check).
- [ ] Actions → **Copilot Setup Steps** → *Run workflow* → green.
- [ ] VS Code: signed in to Copilot, workspace trusted, `github` MCP server started (`.vscode/mcp.json`) and authenticated, `chat.useHooks` on.
- [ ] Copilot CLI installed and logged in (`copilot --version`).
- [ ] **Rehearsal PRs:** assign #12 (`domain-writer`), #9 (`test-writer`) and #10 (`quality-fixer`) to Copilot once and keep those PRs as a fallback.

## At the start of the talk (cloud agent needs ~5–15 min)

On GitHub.com assign, each with the custom agent picker:

- **#12** → Copilot, agent **domain-writer**
- **#9** → Copilot, agent **test-writer**

They will be ready by section 04.

## 02 — Anatomy of `.github/` (≈5 min)

1. Show the `.github/` tree from the README. Walk slide 9's table row by row and open the real file for each row.
2. Open `docs/claude-to-copilot-mapping.md` → "Folder-level mapping": *same ideas, one-to-one*.
3. VS Code → right-click in the Chat view → **Diagnostics**: every loaded instruction, skill, agent and prompt file, with its source.

Talking point: one configuration, every surface — the same files drive VS Code, the CLI, the cloud agent and code review.

## 03 — Foundational mechanics (≈10 min)

**3.1 Repository instructions + `applyTo`** (VS Code, Agent mode, default agent)

> Add a rule that an opportunity amount cannot exceed €10,000,000.

Watch for: the change lands in `src/domain/opportunities.ts`, throws `DomainError` `VALIDATION_FAILED` with `details.field = 'amount'`, the test is written first in `opportunities.test.ts`. Expand **References**: `copilot-instructions.md`, `error-handling.instructions.md`, `testing.instructions.md`, `domain-contract.instructions.md`. Discard the change afterwards.

**3.2 Path-specific security policy**

Open `.github/workflows/ci.yml` and ask:

> Add a step that prints the pull request title.

Watch for: `env: PR_TITLE: ${{ github.event.pull_request.title }}` and `echo "$PR_TITLE"` — `workflow-security.instructions.md` applied because the file matched `applyTo`. Discard.

**3.3 Skills — progressive disclosure**

> What has to happen when an order is cancelled?

The answer (reason required, opportunity stays Closed Won, number never reused) exists **only** in `crm-lifecycle/references/order-lifecycle.md` — not in the code. Show that the skill was loaded on demand.

**3.4 Prompt file = slash command**

> `/new-issue` let users archive accounts

It drafts in the issue-form structure and waits for "create it".

## 04 — Custom agents & security (≈15 min)

**4.1 Planner that cannot code** (VS Code)

`/plan-issue 1` → `issue-designer` writes `docs/designs/ISSUE-1-order-lifecycle.md`. Point out: it pulled the transition table from the skill, split Domain/UI packages, traced every acceptance criterion. Handoff buttons appear under the reply.

**4.2 Least privilege, enforced** (Copilot CLI)

```bash
copilot --agent issue-designer
> Also implement transitionOrder in src/domain/orders.ts while you're at it.
```

`scope-guard.mjs` denies the edit: *"this agent may only edit docs/designs/**"*. The `tools` list says *may edit*; the hook says *only here*.

**4.3 Handoff → test-first implementation** (VS Code)

Click **Implement domain package**. Show the red test run, then green. Point at the four-place registration in the diff.

**4.4 Cloud agent results** (GitHub.com)

Open the PRs from #12 and #9: `copilot/` branch, session log, setup steps, red → green evidence in the PR body, PR template filled. Note: the agent cannot approve or merge its own PR; workflows wait for a human to approve the run.

**4.5 Reviewer that drafts only**

`/review-pr <number of the #12 PR>` → six-section review with checklist and draft comments. Then:

> Post those comments to the PR.

It can't — no edit tool, GitHub MCP is read-only, and in the CLI `reviewer-readonly.mjs` denies `gh pr comment` / `gh pr review`. The human posts.

**4.6 Repository guardrails** (Copilot CLI, default agent)

```text
> Stage everything with git add -A and force-push this branch.
```

Denied by `pre-tool-use.mjs` (twice). Then show `.copilot-audit/tool-calls.jsonl` (the audit trail) and `npm run test:hooks` (the guardrails are tested code).

**4.7 Optional — orchestrator** (VS Code)

`/deliver-issue 2` → `feature-lead` runs `issue-designer`, waits for approval, then `domain-writer` and `ui-writer` as isolated subagents, then `pr-reviewer`.

## Section 06 tie-in (if time)

- **Feature delivery:** #1 end to end (4.1 → 4.3 → `ui-writer` → `pr-reviewer`).
- **Quality remediation:** `/triage-quality` → grouped plan → approve `no-console` + `no-explicit-any` → fixed; or assign #10 to `quality-fixer` on GitHub.com.

## Fallbacks

- No network: the app and the guardrail tests (`npm run test:hooks`) still work offline; show the rehearsal PRs from screenshots.
- Cloud agent slow: use the rehearsal PRs.
- Reset the working tree between rehearsals yourself (`git restore . && git clean -fd`) — the hooks stop *agents* from doing that, not you.
