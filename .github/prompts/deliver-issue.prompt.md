---
name: deliver-issue
description: "Take an issue from design to reviewed changes using the feature-lead orchestrator and its specialist subagents."
argument-hint: "issue number, e.g. 3"
agent: feature-lead
---

Deliver GitHub issue #${input:issue:issue number} end to end.

- Start with `issue-designer`. Show me the breakdown and open questions, then **wait for my approval**.
- After approval, run `domain-writer` then `ui-writer` (only the packages the design lists), then `pr-reviewer` on the working-tree changes.
- Stop and ask me whenever a subagent reports a blocker, a missing dependency, or a failing `npm run verify`.
- Finish with the stage table and what I need to do next (commit, push, open the PR).
