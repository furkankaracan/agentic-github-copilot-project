# Technical designs (agent handoff artifacts)

`issue-designer` writes one file per issue here: `ISSUE-<number>-<kebab-slug>.md`, using the template in `.github/skills/issue-planning/references/design-template.md`.

- Implementation agents (`domain-writer`, `ui-writer`, `test-writer`) read the design — not the designer's chat history.
- On GitHub.com the design arrives in its own PR; reviewing that PR is the human approval gate.
- The design is **disposable**: the final feature PR for the issue deletes it (with the reviewer's consent). Durable knowledge belongs in an instruction file or skill, not here.
