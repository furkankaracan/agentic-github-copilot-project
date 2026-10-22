---
name: plan-issue
description: "Plan a GitHub issue: read it, audit the code, and write a technical design to docs/designs/."
argument-hint: "issue number, e.g. 3"
agent: issue-designer
---

Plan GitHub issue #${input:issue:issue number} of this repository.

1. Read the issue and all its comments with the GitHub MCP tools.
2. Ask me about anything vague **before** you design — in rounds if there are many points.
3. Follow the `issue-planning` skill and write `docs/designs/ISSUE-${input:issue}-<slug>.md`.
4. Reply with the file path, the breakdown table and the open questions. Do not implement anything.
