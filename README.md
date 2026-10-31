# Contoso CRM — agentic development with GitHub Copilot

A deliberately small CRM (**Accounts → Contacts → Opportunities → Orders**) for hands-on practice
with agentic development and GitHub Copilot. Clone or fork it, explore the agent configuration,
and build a feature, add tests or fix a bug.

The app is intentionally incomplete. The practice ideas below give you a starting point for using
custom agents to plan, implement, test and review changes — inside the guardrails defined in `.github/`.

## Run it

Use **Node 22** (see [.nvmrc](.nvmrc)) and npm. GitHub Copilot is optional for running the app;
using the agents requires Copilot access in your chosen tool.

1. Fork the repository for your own branches, pull requests and agent experiments, or clone it to explore locally.
2. Copy the clone URL from the **Code** button on the repository you want to use.
3. Run:

```bash
git clone <repository-url>
cd agentic-github-copilot-project
npm ci
npm run dev        # http://localhost:5173
```

Static seed data, no backend, no database. Every change lives in memory and resets on reload.
The sample names and contact details are fictional; email addresses use reserved `.example` domains.
Do not enter real customer or personal data.

| Command | What it does |
| --- | --- |
| `npm test` | Unit + UI tests (Vitest, React Testing Library) |
| `npm run test:hooks` | Tests for the guardrail hooks themselves |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run verify` | lint + typecheck + test — the "done" gate for agents |
| `npm run build` | Production build |

## What's built and what you can try

| Area | Built | Practice ideas |
| --- | --- | --- |
| Accounts | List with search, detail, create | Edit, delete with guard |
| Contacts | List with search and account filter, create (linked to account) | Detail + edit, broader domain tests |
| Opportunities | List, detail, create, stage pipeline with state machine | Loss reason, stage filter, weighted forecast |
| Orders | Create from won opportunity, list, detail | Status lifecycle (submit → fulfil → invoice / cancel), line editing |
| Dashboard | Pipeline, won revenue, win rate, closing next, latest orders | **Bug:** open pipeline includes lost deals |

These exercises are self-contained; you do not need the original repository's issues or pull requests.
Issues are not copied when you clone or fork. If you want to use the issue-based agents, enable **Issues**
in your fork's settings and create your own using the included feature and bug templates.

## Try an agent workflow

1. Pick one practice idea and describe its expected behavior and acceptance criteria.
2. In VS Code, use `/new-issue` to draft an issue; approve its creation in your fork.
3. Use `/plan-issue <your-issue-number>` to produce a technical design, then review it before implementation.
4. Hand the approved work to `domain-writer` and/or `ui-writer`, or use `/deliver-issue <your-issue-number>`
   for the staged workflow with human approval gates.
5. Run `npm run verify` and review the resulting pull request before merging it yourself.

For smaller experiments, ask `test-writer` to cover an existing module or use `/write-tests`.
Use `/review-pr <your-pr-number>` for draft review comments or `/triage-quality` for a read-only
quality plan before approving fixes. Agents never merge or approve pull requests for you.

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

Start with [the repository instructions](.github/copilot-instructions.md), then explore the
path-specific policies, skills, specialist agents and prompts. Instructions guide the agents;
hooks enforce guardrails on supported tools. Keep those guardrails enabled while experimenting.

## Configure your fork

1. For local agent work, sign in to Copilot in VS Code or Copilot CLI. The included VS Code settings
   enable hooks; the optional GitHub MCP server is read-only and needs authentication.
2. For issue-based workflows, enable **Issues** and create your own practice issues.
3. Optional: enable **Copilot cloud agent** (Settings → Copilot → Cloud agent), **Copilot code review**
   or **Copilot Memory**, depending on availability for your account.
4. Add your own maintainers to [CODEOWNERS](.github/CODEOWNERS) if you want automatic review requests.
   It is an inactive template until you configure it. Choose branch protection or rulesets for your fork
   as appropriate; agents must use branches and pull requests regardless.

## License

[MIT](LICENSE). You may reuse, modify and share the code and learning material under the license terms.
