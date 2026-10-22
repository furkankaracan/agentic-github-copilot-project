---
name: pr-review
description: "Structured, evidence-based review of a Contoso CRM pull request: fetch the PR and its linked issue, compute the real diff, audit acceptance criteria in both directions, apply the repository checklist file by file, verify the author's replies to earlier comments, and return ready-to-post draft comments for human approval. Use when asked to review a PR by number or URL, re-review after changes, or apply the PR checklist."
---

# PR review — Contoso CRM

Goal: a **consistent, grounded** review. Every finding points at a line in the PR's diff and cites a rule (instruction file or skill) — not an opinion. You **draft**; a human posts. You never approve, request changes, comment, merge or push.

## Step 1 — Fetch the PR

Prefer the GitHub MCP server (read-only): `pull_request_read` (methods: `get`, `get_diff`, `get_files`, `get_review_comments`, `get_reviews`, `get_status`) and `issue_read` for the linked issue.

CLI fallback (read-only commands only):

```bash
gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRefOid,closingIssuesReferences,files
gh pr diff <n>
gh pr checks <n>
gh api repos/{owner}/{repo}/pulls/<n>/comments      # GET only
```

## Step 2 — Get the real diff

Review the diff GitHub shows for the PR (merge-base → head), never `base..head` on a stale local branch — that attributes unrelated base-branch changes to the PR. If you diff locally: `git fetch origin <base> <head>` then `git diff $(git merge-base origin/<base> <headSha>) <headSha>`.

## Step 3 — Issue audit (both directions)

From `closingIssuesReferences` (or "Closes #n" in the body), read the issue and any `docs/designs/ISSUE-<n>-*.md`:

- Acceptance criterion not covered by the diff → finding.
- Substantial change with no basis in the issue/design → "out of scope, confirm intent" finding. Skip trivial one-liners.
- No linked issue → finding.

## Step 4 — Checklist

Categorize changed files and apply [references/checklist.md](references/checklist.md) section by section. Mark every section ✅ / ❌ / ⚠️ / N/A. Run `npm run verify` if you have a shell — report the result; never "fix" anything.

## Step 5 — Earlier review threads

For each thread with an author reply, verify the claim against the **current head**: "fixed" → confirm in code; push-back → check the cited rule; design trade-off → mark *needs human decision* with both positions.

## Comment language

- Lead with the action, one action per comment: "Move this check into `transitionOrder` — …"
- Give the concrete failure scenario ("Submitting `ord-002` twice would…").
- Cite the rule: "(`domain-contract.instructions.md` › State machines)".
- Mechanical fixes include a ```suggestion block.
- No praise padding, no "consider maybe".

## Output (final message, in order)

1. **Summary** — title, author, linked issue, areas touched, `npm run verify` result.
2. **Issue audit** — table: criterion | covered? | evidence.
3. **Checklist** — one table per applicable section (item | status | note); N/A sections listed.
4. **Draft comments** — `path:line` (line valid at head) + full comment text.
5. **Thread verdicts** — ✅ resolve / ❌ push back (draft reply) / ➖ needs human decision.
6. **Verdict recommendation** — Approve / Request changes / Comment, with one-line reason. The human decides.
