---
name: review-pr
description: "Review a pull request against its issue and the repository checklist. Returns draft comments only."
argument-hint: "PR number, e.g. 7"
agent: pr-reviewer
---

Review pull request #${input:pr:PR number} in this repository.

Follow the `pr-review` skill exactly. Read its `references/checklist.md` before applying the checklist. Return the six sections (summary, issue audit, checklist, draft comments, thread verdicts, verdict recommendation). Do not post, approve or change anything — I will post the comments I agree with.
