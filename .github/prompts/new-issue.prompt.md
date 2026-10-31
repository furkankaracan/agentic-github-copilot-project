---
name: new-issue
description: "Turn a rough idea into a well-formed GitHub issue (user story + acceptance criteria) ready for an agent to pick up."
argument-hint: "one-line idea, e.g. let users archive accounts"
agent: agent
tools: ["read", "search", "execute", "github/*"]
---

Turn this idea into a GitHub issue for Contoso CRM: **${input:idea:describe the feature or bug}**

1. Search the code (`src/domain`, `src/features`) and the `crm-lifecycle` skill so the issue matches how the app actually works. Search existing issues to avoid duplicates.
2. Draft the issue using the structure of `.github/ISSUE_TEMPLATE/feature.yml` (or `bug.yml` for a defect):
   - Title: imperative, ≤ 70 characters.
   - User story: "As a <role>, I want <capability> so that <benefit>."
   - Acceptance criteria: numbered, each one testable, each naming the exact UI label or domain rule.
   - Out of scope.
   - Sample data: which seed ids show the change.
3. Show me the draft. Create it on GitHub only after I say "create it" — use `gh issue create --title "<title>" --body-file <tmp file> --label <feature|bug>` (the GitHub MCP server here is read-only) — then reply with the issue URL.
