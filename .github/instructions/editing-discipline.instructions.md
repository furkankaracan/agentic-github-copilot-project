---
description: "Scope discipline, deletion consent and self-review rules for every edit an agent makes."
applyTo: "**"
---

# Editing discipline

Always-on. Applies to every file you edit, anywhere in the repository.

## Scope discipline

- Change only what the task requires. Do **not** add features, options, abstractions or refactorings that were not requested.
- Do **not** "clean up" surrounding code, even when it is obviously suboptimal. Report it as an observation instead.
- When a technical design (`docs/designs/ISSUE-*.md`) exists for your task, implement **only** the work package assigned to you. Other packages are someone else's scope — list them as dependencies in your summary.

## Formatting & whitespace

- Never reformat a file just to match a style guide.
- Preserve existing indentation, quote style, blank-line conventions and line endings.
- Do not auto-sort imports or members unless you are adding an entry that belongs in a specific position.

## When in doubt, ask

- If the requested change conflicts with the existing style or with an instruction, surface the conflict instead of silently choosing a side.
- If a refactor seems necessary to land the change, propose it as a follow-up — don't fold it in.

## Deletions

- **Never delete a file without explicit written consent** from the user. This includes `rm`, `Remove-Item`, `git rm`, `git add -u`, `git add -A`, and overwriting a file with unrelated content.
- Before any deletion, list the path(s) and ask: "Do you want to proceed?"
- "Cleaning up" is not a reason to skip consent. A `preToolUse` hook enforces this for shell commands.

## Branches and pull requests (hard rule)

- **Never commit or push to `main`.** Work on an `agent/<issue>-<slug>` branch (cloud agent: its `copilot/*` branch).
- **Every change ends in a pull request** to `main` — no exceptions for small, urgent or docs-only changes. A human merges it.
- `main` is intentionally unprotected so humans can push directly; that permission does not extend to agents. The `preToolUse` hook denies `git push … main` and force-pushes as a backstop.
- The full step-by-step flow is in `.github/copilot-instructions.md` › *Git workflow*.

## Out-of-scope findings

If you notice something that should change but is out of scope:

1. Make the in-scope change.
2. Add a short **Observations** section to your final reply or PR description — not code comments, not TODOs.
3. Let the human decide whether to open a follow-up issue.

## Generated and protected files

Never edit by hand:

- `package-lock.json` — change dependencies with `npm install <pkg>` / `npm uninstall <pkg>` only, and only when the task requires it.
- `dist/**`, `coverage/**`, `node_modules/**`.
- `.github/hooks/**` — guardrails are changed by humans in a reviewed PR.

## Self-review before you finish

1. Re-read every file you created or changed, top to bottom.
2. Check every new file is in the right folder with the right name (see `code-style.instructions.md`).
3. Run `npm run verify`. Fix every failure you caused.
4. Commit on your branch, push it, and open the pull request.
5. Summarize: PR URL, files changed, tests added, verify result, observations.
