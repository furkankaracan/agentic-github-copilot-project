#!/usr/bin/env node
// Repository-wide preToolUse guardrail (runs for every agent, every surface that supports hooks).
// Instructions *guide* the agent; this script *enforces* the rules that must never be broken.
import { execFileSync } from 'node:child_process';
import { deny, editedPaths, isEdit, isShell, matchesAny, pass, patchDeletesFiles, readPayload, shellCommand, toolInfo } from './lib.mjs';

const PROTECTED_PATHS = [
  '.github/hooks/**',
  'package-lock.json',
  '.env',
  '.env.*',
  'dist/**',
  'coverage/**',
  'node_modules/**',
];

const SHELL_RULES = [
  [/\bgit\s+push\b[^\n]*\s(--force\b|--force-with-lease\b|-f\b)/, 'Force-pushing rewrites shared history. Push a new commit instead.'],
  [/\bgit\s+push\b[^\n]*[\s:](main|master)(\s|$)/, 'Never push directly to main. Push a feature branch and open a pull request.'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard discards work irreversibly. Ask the user first.'],
  [/\bgit\s+clean\s+-[a-z]*f/, 'git clean deletes untracked files. Ask the user first.'],
  [/\bgit\s+rm\b/, 'Deleting tracked files requires explicit written consent from the user (editing-discipline › Deletions).'],
  [/\bgit\s+add\s+(-u|--update|-A|--all)\b/, 'git add -u/-A also stages deletions. Stage explicit paths instead (editing-discipline › Deletions).'],
  [/(^|[;&|]\s*|\s)(rm|rmdir|del|rd|erase)\s/i, 'File deletion requires explicit written consent from the user (editing-discipline › Deletions).'],
  [/\bRemove-Item\b|\bri\s+-/i, 'File deletion requires explicit written consent from the user (editing-discipline › Deletions).'],
  [/\bgh\s+pr\s+merge\b/, 'Agents never merge pull requests. A human merges after review.'],
  [/\bgh\s+pr\s+review\b[^\n]*--approve\b/, 'Agents never approve pull requests. A human approves.'],
  [/\bgh\s+(repo\s+delete|release\s+(create|delete))\b/, 'Repository and release administration is human-only.'],
  [/\bnpm\s+publish\b/, 'Publishing packages is human-only.'],
  [/\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(sh|bash|iex|Invoke-Expression)\b/i, 'Piping downloaded scripts into a shell is not allowed.'],
  [/>\s*\.env\b/, 'Do not write secrets files.'],
];

function stagesDeletions(command, cwd) {
  if (!/\bgit\s+add\s+(\.|\*|:\/)(\s|$)/.test(command)) return false;
  try {
    const status = execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8', timeout: 5000 });
    return status.split('\n').some((line) => /^( D|D |AD|MD)/.test(line));
  } catch {
    return false;
  }
}

const payload = await readPayload();
const tool = toolInfo(payload);

if (isShell(tool)) {
  const command = shellCommand(tool);
  for (const [pattern, reason] of SHELL_RULES) {
    if (pattern.test(command)) deny(`Blocked by .github/hooks/scripts/pre-tool-use.mjs: ${reason}`);
  }
  if (stagesDeletions(command, tool.cwd)) {
    deny(
      'Blocked by pre-tool-use.mjs: the working tree contains deleted files and `git add .` would stage them. ' +
        'List the deletions to the user and ask for consent, or stage explicit paths.',
    );
  }
}

if (isEdit(tool)) {
  if (patchDeletesFiles(tool)) {
    deny('Blocked by pre-tool-use.mjs: this patch deletes a file. Deletions require explicit written consent from the user.');
  }
  for (const p of editedPaths(tool)) {
    if (p.startsWith('<outside-repo>/')) deny(`Blocked by pre-tool-use.mjs: ${p} is outside the repository.`);
    if (matchesAny(p, PROTECTED_PATHS)) {
      deny(`Blocked by pre-tool-use.mjs: ${p} is protected (generated, secret, or a guardrail). Change it through npm/the build, or ask a human.`);
    }
  }
}

pass();
