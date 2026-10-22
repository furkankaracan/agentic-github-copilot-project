#!/usr/bin/env node
// Agent-scoped preToolUse hook for pr-reviewer: an allowlist, not a denylist.
// Every shell command segment must match a known read-only command, or the call is denied.
import { deny, isEdit, isShell, pass, readPayload, shellCommand, toolInfo } from './lib.mjs';

const READ_ONLY = [
  /^git\s+(diff|log|show|fetch|merge-base|status|rev-parse|blame|ls-files|cat-file|branch\s+--show-current)\b/,
  /^gh\s+pr\s+(view|diff|checks|list|status)\b/,
  /^gh\s+issue\s+(view|list)\b/,
  /^npm\s+(test|run\s+(lint|typecheck|verify|build|test))\b/,
  /^npx\s+(vitest\s+run|eslint|tsc\s+-b)\b/,
  /^(cat|ls|head|tail|wc|grep|rg|echo|pwd|Get-Content|Get-ChildItem|Select-String)\b/i,
];

/** `gh api` is read-only only when it stays a GET and sends no body fields. */
function isReadOnlyGhApi(segment) {
  if (!/^gh\s+api\b/.test(segment)) return false;
  const tokens = segment.split(/\s+/);
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    if ((t === '-X' || t === '--method') && tokens[i + 1]?.toUpperCase() !== 'GET') return false;
    if (/^(-X|--method=)(?!GET$)/i.test(t) && t !== '-X' && t !== '--method') return false;
    if (/^(-f|-F|--field|--raw-field|--input)(=|$)/.test(t)) return false;
  }
  return true;
}

function segments(command) {
  return command
    .split(/&&|\|\||;|\||\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const payload = await readPayload();
const tool = toolInfo(payload);

if (isEdit(tool)) {
  deny('Blocked by reviewer-readonly.mjs: pr-reviewer drafts comments; it never edits files.');
}

if (isShell(tool)) {
  const command = shellCommand(tool);
  if (/[^-]>\s*\S/.test(command)) {
    deny('Blocked by reviewer-readonly.mjs: output redirection writes files. Print to stdout instead.');
  }
  for (const segment of segments(command)) {
    if (!isReadOnlyGhApi(segment) && !READ_ONLY.some((re) => re.test(segment))) {
      deny(
        `Blocked by reviewer-readonly.mjs: "${segment}" is not on the read-only allowlist. ` +
          'pr-reviewer may read PRs, diffs and run checks, but never comment, approve, push, check out or merge.',
      );
    }
  }
}

pass();
