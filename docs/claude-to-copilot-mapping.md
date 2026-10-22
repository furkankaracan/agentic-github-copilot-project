# From `.claude/` to `.github/` — how a production Claude Code setup maps to GitHub Copilot

This repository mirrors the agent setup of a real production codebase (a Dynamics 365 / Dataverse solution with C# plugins, a business-logic layer, JavaScript web resources and Azure DevOps pipelines). That project can't be shown publicly, so the same **structure and ideas** were rebuilt here on a small React CRM. Every artifact below has a one-to-one counterpart.

## Folder-level mapping

```
REAL PROJECT (.claude/)                         THIS REPO (.github/)
├── CLAUDE.md                                   ├── copilot-instructions.md
├── rules/            (6, always-on)            ├── instructions/        (6, applyTo-scoped)
├── skills/           (7, SKILL.md + refs)      ├── skills/              (7, SKILL.md + refs)
├── agents/           (7)                       ├── agents/              (7: 6 specialists + 1 orchestrator)
├── (commands/ — unused)                        ├── prompts/             (6 slash commands, VS Code)
├── settings.local.json  (permission allow-list)├── hooks/               (guardrails.json + scripts, committed)
├── designs/          (gitignored handoffs)     docs/designs/            (committed — the PR is the handoff)
└── reviews/          (draft reviews)           (drafts returned in the agent's reply)
                                                ├── workflows/copilot-setup-steps.yml (cloud-agent sandbox)
                                                ├── CODEOWNERS (protect the protectors)
                                                .vscode/mcp.json (GitHub MCP, read-only)
```

## Artifact-by-artifact

### Project memory

| Real project | Purpose there | Here | Notes |
| --- | --- | --- | --- |
| `CLAUDE.md` | Stack, non-standard build commands, base-class quick reference, "where to look first" table, never-do list, order of precedence | `.github/copilot-instructions.md` | Same sections, same order. Read by VS Code, Visual Studio, Copilot CLI, cloud agent and Copilot code review. (Copilot CLI also reads `CLAUDE.md` directly.) |

### Rules → path-specific instructions

| Real `.claude/rules/` | Encodes | Here (`.github/instructions/`) | `applyTo` |
| --- | --- | --- | --- |
| `code-style.md` | Naming table, consistency over cleverness | `code-style.instructions.md` | `**` |
| `editing-discipline.md` | Scope isolation, deletion consent, self-review | `editing-discipline.instructions.md` | `**` |
| `error-handling.md` | One exception type (`BusinessLogicException`), never `InvalidPluginExecutionException` | `error-handling.instructions.md` — one error type (`DomainError`), never `new Error` | `src/**/*.ts,src/**/*.tsx` |
| `testing.md` | MSTest test-first, bucket rules, assertion rules | `testing.instructions.md` — Vitest test-first, placement, assertion rules | `src/**/*.ts,src/**/*.tsx` |
| `plugin-registration.md` | Reflection-driven `[PluginStep]` registration — "an undecorated class is invisible" | `domain-contract.instructions.md` — four-place action registration — "an unwired function is invisible" | `src/domain/**,src/store/**,…` |
| `pipeline-security.md` | No `${{ parameters.x }}` in ADO script bodies — use `env:` | `workflow-security.instructions.md` — no `${{ github.event.* }}` in `run:` — use `env:` | `.github/workflows/**` |

Difference worth saying on stage: in the real project all rules are always loaded. Copilot's `applyTo` lets the layer-specific ones load only when matching files are in play — less context, same enforcement.

### Skills (same open `SKILL.md` format)

| Real `.claude/skills/` | Here (`.github/skills/`) | The "senior-engineer knowledge" it carries |
| --- | --- | --- |
| `d365-plugin-development` (+7 references) | `domain-development` (+3 references) | Framework skeletons, query/state patterns, testing infrastructure |
| `incident-automated-process` | `crm-lifecycle` | The gnarly state machine nobody can derive from the code alone |
| `pbi-planning` | `issue-planning` | Clarify → audit → split → design template |
| `webresource-authoring` | `react-ui-authoring` | Front-end conventions and page anatomy |
| `pr-review` (+ ADO CLI, checklist) | `pr-review` (+ checklist) | Merge-base diff, issue audit both ways, checklist, comment language, human sign-off |
| `sonarqube-remediation` | `quality-remediation` | Two hard-separated phases: read-only plan → human approval → apply |
| `pipeline-development` | `workflow-development` | CI conventions, setup-steps, injection-safe pattern |

Skills are **progressively disclosed**: only `name` + `description` are in context until a task matches. Copilot also reads skills from `.claude/skills/`, so a team can migrate incrementally.

### Agents → custom agents

| Real `.claude/agents/` | Here (`.github/agents/`) | `tools` (least privilege) | Extra hard boundary |
| --- | --- | --- | --- |
| `pbi-technical-designer` | `issue-designer.agent.md` | `read, search, edit, todo, github/*` | `scope-guard.mjs` hook: edits only `docs/designs/**` |
| `plugin-writer` | `domain-writer.agent.md` | `read, search, edit, execute, todo` | hook: edits only `src/domain|store|data/**` |
| `webresource-writer` | `ui-writer.agent.md` | `read, search, edit, execute, todo` | hook: edits only UI paths |
| `mock-test-generator` | `test-writer.agent.md` | `read, search, edit, execute, todo` | hook: edits only `*.test.ts(x)` |
| `pr-reviewer` | `pr-reviewer.agent.md` | `read, search, execute, github/*` — **no `edit`** | `reviewer-readonly.mjs` allowlist; GitHub MCP read-only |
| `sonarqube-fixer-backend` + `-frontend` | `quality-fixer.agent.md` | `read, search, edit, execute, todo, github/*` | Phase 1 ends in a pause |
| *(main session orchestrated)* | `feature-lead.agent.md` | `agent, read, search, todo` — **no edit/execute** | `agents:` allowlist of subagents |

Tool-name translation (Copilot accepts the Claude names as aliases):

| Claude Code | Copilot alias |
| --- | --- |
| `Read` | `read` |
| `Edit`, `Write`, `MultiEdit` | `edit` |
| `Grep`, `Glob` | `search` |
| `Bash`, `PowerShell` | `execute` |
| `Task` | `agent` |
| `WebFetch`, `WebSearch` | `web` |
| `TodoWrite` | `todo` |
| `mcp__sonarqube__show_rule` | `sonarqube/show_rule` |

Frontmatter that does **not** carry over:

| Claude field | Copilot equivalent |
| --- | --- |
| `skills:` (preload a skill) | None. The agent body names the skill; Copilot loads it by description. |
| `color`, `effort` | None (VS Code supports `reasoning-effort`). |
| `model: sonnet` | `model:` with a Copilot model name (optional). |
| — | `handoffs:` (VS Code) — one-click "next step" buttons between agents. |
| — | `agents:` (VS Code) — which subagents an orchestrator may call. |
| — | `hooks:` (Copilot CLI) — agent-scoped guardrails. |
| — | `mcp-servers:` (cloud agent) — per-agent MCP servers and secrets. |

### Permissions → layered guardrails

| Real project | Here |
| --- | --- |
| `settings.local.json` allow-list (per developer, ~70 entries accumulated over time) | **Committed**, reviewed guardrails: `.github/hooks/guardrails.json` → `pre-tool-use.mjs` (deny force-push, push to main, deletions, merge/approve, editing protected files) |
| Agent `tools:` list | Agent `tools:` list (same idea, portable aliases) |
| "Never post to ADO" in the agent prompt | `pr-reviewer` has no edit tool + `reviewer-readonly.mjs` allowlist + read-only GitHub MCP |
| SonarQube MCP with `SONARQUBE_READ_ONLY=true` | GitHub MCP at `/mcp/readonly`; cloud agent's GitHub MCP is read-only by default |
| — | Per-developer CLI approvals still exist (`--allow-tool`, `--deny-tool`) but are personal; team policy lives in hooks |
| — | `CODEOWNERS` on `.github/agents|instructions|skills|hooks/` (auto-requests review; enforceable with a ruleset when the team has a second reviewer) |
| — | **Agents always deliver through a PR** (`copilot-instructions.md` › Git workflow), even though `main` itself is unprotected for humans |
| — | The guardrails have their own tests (`npm run test:hooks`) |

### Handoffs

| Real project | Here |
| --- | --- |
| `.claude/designs/*.md`, gitignored, passed between local sessions | `docs/designs/ISSUE-<n>-*.md`, committed — on GitHub.com the design PR **is** the approval gate; deleted by the final feature PR |
| `.claude/reviews/PR-<id>.md` | Draft comments in `pr-reviewer`'s reply; a human posts them |

## Where each piece works

| Artifact | VS Code | Copilot CLI | Cloud agent (GitHub.com) | Code review |
| --- | :-: | :-: | :-: | :-: |
| `copilot-instructions.md` | ✓ | ✓ | ✓ | ✓ |
| `instructions/*.instructions.md` | ✓ | ✓ | ✓ | ✓ |
| Skills | ✓ | ✓ | ✓ | ✓ |
| Custom agents | ✓ | ✓ | ✓ | — |
| `handoffs`, `agents` (subagents) | ✓ | subagents ✓ | ✗ | — |
| Agent-scoped `hooks` | preview | ✓ | ✗ | — |
| Repo hooks (`.github/hooks/*.json`) | preview | ✓ | ✓ | — |
| Prompt files | ✓ | ✗ | ✗ | — |
| `copilot-setup-steps.yml` | — | — | ✓ | ✓ (reused) |

Say this carefully on stage: the scope-guard hooks enforce agent boundaries in the CLI; on GitHub.com the same boundaries rest on the `tools` list, the repo-level hook, the PR review, and CODEOWNERS.
