---
name: workflow-development
description: "Conventions for the GitHub Actions workflows of Contoso CRM — the CI workflow (lint, typecheck, test, build), the Copilot cloud agent setup workflow (copilot-setup-steps.yml), permissions, caching, and the script-injection-safe env pattern. Use when creating, editing or reviewing any file under .github/workflows/, or when CI or the cloud agent's environment setup fails."
---

# Workflow development — Contoso CRM

## Workflows in this repo

| File | Purpose | Trigger |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `npm ci` → lint → typecheck → test → build | `pull_request`, `push` to `main` |
| `.github/workflows/copilot-setup-steps.yml` | Pre-installs Node 22 + dependencies **before** the Copilot cloud agent starts, so the commands in `copilot-instructions.md` work in its sandbox | `workflow_dispatch`, changes to itself |

## Conventions

- Node version from `.nvmrc` via `actions/setup-node` (`node-version-file: .nvmrc`, `cache: npm`).
- Always `npm ci`, never `npm install`, in CI.
- Each quality gate is its own named step so a failure is obvious in the checks list.
- `permissions: contents: read` unless a step needs more; grant extra scopes at **job** level with a comment explaining why.
- `concurrency` with `cancel-in-progress: true` on PR workflows.
- `timeout-minutes` on every job.

## copilot-setup-steps.yml specifics

- The job **must** be named `copilot-setup-steps`; only `steps`, `permissions`, `runs-on`, `services`, `snapshot`, `timeout-minutes` are honoured.
- It only runs for the cloud agent once it is on the **default branch**.
- Keep it fast: checkout, setup-node with cache, `npm ci`. No tests here — the agent runs them itself.
- Cloud-agent hooks (`.github/hooks/*.json`) run on Linux: scripts must work with `node` and `bash` only.

## Script-injection-safe pattern (mandatory)

```yaml
- name: Comment summary
  env:
    TITLE: ${{ github.event.pull_request.title }}
  run: |
    echo "Reviewing: $TITLE"
```

Untrusted contexts include every `github.event.*` field a user can type (titles, bodies, comments, branch names, commit messages), `github.head_ref`, and string `inputs`.

## Validating a workflow change

1. YAML parses (`npx --yes yaml-lint <file>` or open the Actions tab — a parse error shows immediately).
2. For `copilot-setup-steps.yml`, run it manually from the Actions tab (`workflow_dispatch`) and confirm it is green.
3. Re-read against `workflow-security.instructions.md`.
