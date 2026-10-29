# Contoso CRM — agentic development with GitHub Copilot

A deliberately small CRM (**Accounts → Contacts → Opportunities → Orders**) used as a live demo for
*"Building an Agentic Workforce for Your Code Repo — GitHub Copilot Edition"*.

The app is only half built on purpose. The rest of the backlog lives in **GitHub Issues**, written so that
Copilot custom agents can plan, implement, test and review them — inside the guardrails defined in `.github/`.

## Run it

```bash
npm ci
npm run dev        # http://localhost:5173
```

Static seed data, no backend, no database. Every change lives in memory and resets on reload.

| Command | What it does |
| --- | --- |
| `npm test` | Unit + UI tests (Vitest, React Testing Library) |
| `npm run test:hooks` | Tests for the guardrail hooks themselves |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run verify` | lint + typecheck + test — the "done" gate for agents |
| `npm run build` | Production build |

## What's built vs. what's in the backlog

| Area | Built | Backlog (issues) |
| --- | --- | --- |
| Accounts | List with search, detail, create | Edit, delete with guard |
| Contacts | List with search and account filter, create (linked to account) | Detail + edit, broader domain tests |
| Opportunities | List, detail, create, stage pipeline with state machine | Loss reason, stage filter, weighted forecast |
| Orders | Create from won opportunity, list, detail | Status lifecycle (submit → fulfil → invoice / cancel), line editing |
| Dashboard | Pipeline, won revenue, win rate, closing next, latest orders | **Bug:** open pipeline includes lost deals |

## The agentic setup (`.github/`)

```
.github/
├── copilot-instructions.md        # day-one orientation: stack, commands, architecture, never-do list
├── instructions/                  # standing policy, scoped with applyTo
│   ├── code-style.instructions.md          (**)
│   ├── editing-discipline.instructions.md  (**)
│   ├── error-handling.instructions.md      (src/**)
│   ├── testing.instructions.md             (src/**)
│   ├── domain-contract.instructions.md     (src/domain/**, src/store/**)
│   └── workflow-security.instructions.md   (.github/workflows/**)
├── skills/                        # runbooks, loaded on demand
│   ├── domain-development/   crm-lifecycle/   issue-planning/   react-ui-authoring/
│   └── pr-review/            quality-remediation/   workflow-development/
├── agents/                        # specialist coworkers with least-privilege tools
│   ├── issue-designer   domain-writer   ui-writer   test-writer
│   └── pr-reviewer      quality-fixer   feature-lead (orchestrator)
├── prompts/                       # slash commands (VS Code): /plan-issue /deliver-issue /write-tests /review-pr /triage-quality /new-issue
├── hooks/                         # deterministic guardrails: guardrails.json + scripts/
├── workflows/                     # ci.yml, copilot-setup-steps.yml
├── ISSUE_TEMPLATE/  pull_request_template.md  CODEOWNERS
.vscode/mcp.json                   # GitHub MCP server, read-only
docs/designs/                      # handoff artifacts written by issue-designer
```

- **How it maps from a real Claude Code setup:** [docs/claude-to-copilot-mapping.md](docs/claude-to-copilot-mapping.md)
- **Live demo runbook:** [docs/demo-script.md](docs/demo-script.md)

## One-time repository settings for the demo

1. **Copilot cloud agent** enabled for the repository (Settings → Copilot → Cloud agent).
2. **No branch protection on `main`, on purpose**: humans may push directly. Agents may not — `.github/copilot-instructions.md` › *Git workflow* makes every agent change go through a pull request, and the `preToolUse` hook denies `git push … main`. `CODEOWNERS` auto-requests your review on PRs that touch the agent configuration.
3. Optional: **Copilot code review** on pull requests, and **Copilot Memory** for the repository.
