#!/usr/bin/env node
// Agent-scoped preToolUse hook: restricts which files an agent may edit.
//   node scope-guard.mjs --allow "src/domain/**" --allow "src/store/**"
// The `tools` list in an agent profile can say "may edit" but not "may edit only here" —
// this hook adds the path dimension. (Agent-scoped hooks: Copilot CLI.)
import { deny, editedPaths, isEdit, matchesAny, pass, readPayload, toolInfo } from './lib.mjs';

const allow = [];
for (let i = 2; i < process.argv.length; i += 1) {
  if (process.argv[i] === '--allow' && process.argv[i + 1]) {
    allow.push(process.argv[i + 1]);
    i += 1;
  }
}

const payload = await readPayload();
const tool = toolInfo(payload);

if (isEdit(tool)) {
  for (const p of editedPaths(tool)) {
    if (!matchesAny(p, allow)) {
      deny(
        `Blocked by scope-guard.mjs: this agent may only edit ${allow.join(', ')}. ` +
          `${p} is outside its scope — report it as a dependency for the agent that owns it.`,
      );
    }
  }
}

pass();
