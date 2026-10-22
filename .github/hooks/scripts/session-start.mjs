#!/usr/bin/env node
// sessionStart hook: inject live repository context the static instructions can't know.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { readPayload } from './lib.mjs';

const payload = await readPayload();
const cwd = String(payload.cwd ?? process.cwd());

function git(args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    return '';
  }
}

let designs = [];
try {
  designs = readdirSync(path.join(cwd, 'docs', 'designs')).filter((f) => /^ISSUE-.*\.md$/.test(f));
} catch {
  designs = [];
}

const branch = git(['branch', '--show-current']) || '(detached or not a git repo)';
const dirty = git(['status', '--porcelain']).split('\n').filter(Boolean).length;

const lines = [
  `Session context (from .github/hooks/scripts/session-start.mjs):`,
  `- Current branch: ${branch}${dirty ? ` — ${dirty} uncommitted change(s)` : ''}`,
  designs.length
    ? `- Open technical designs: ${designs.map((d) => `docs/designs/${d}`).join(', ')}`
    : '- No open technical designs in docs/designs/.',
  '- Before finishing any code change: run `npm run verify` and report the result.',
];

process.stdout.write(JSON.stringify({ additionalContext: lines.join('\n') }));
