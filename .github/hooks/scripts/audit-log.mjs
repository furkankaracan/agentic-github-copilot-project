#!/usr/bin/env node
// postToolUse hook: append an audit line per tool call to .copilot-audit/tool-calls.jsonl (gitignored).
// Gives the team a reviewable trail of what an agent actually did, independent of its own summary.
import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { editedPaths, isEdit, isShell, readPayload, shellCommand, toolInfo } from './lib.mjs';

const payload = await readPayload();
const tool = toolInfo(payload);

const entry = {
  at: new Date().toISOString(),
  session: payload.sessionId ?? payload.session_id ?? null,
  agent: payload.agentType ?? payload.agent_type ?? 'main',
  tool: tool.name,
  ...(isShell(tool) ? { command: shellCommand(tool).slice(0, 500) } : {}),
  ...(isEdit(tool) ? { files: editedPaths(tool) } : {}),
};

try {
  const dir = path.join(tool.cwd, '.copilot-audit');
  mkdirSync(dir, { recursive: true });
  appendFileSync(path.join(dir, 'tool-calls.jsonl'), `${JSON.stringify(entry)}\n`);
} catch {
  // Auditing must never break the agent's work.
}
process.exit(0);
