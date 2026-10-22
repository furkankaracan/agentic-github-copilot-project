// Shared helpers for Copilot hook scripts.
// Hooks receive one JSON payload on stdin and may print one JSON decision on stdout.
// Payloads come in two shapes: camelCase (toolName/toolArgs — Copilot CLI & cloud agent)
// and VS Code-compatible snake_case (tool_name/tool_input). Both are handled here.
import path from 'node:path';

export async function readPayload() {
  let raw = '';
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function toolInfo(payload) {
  const name = String(payload.toolName ?? payload.tool_name ?? '');
  let args = payload.toolArgs ?? payload.tool_input ?? {};
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch {
      args = { input: args };
    }
  }
  const cwd = String(payload.cwd ?? process.cwd());
  return { name, lower: name.toLowerCase(), args: args ?? {}, cwd };
}

const SHELL_TOOLS = new Set(['bash', 'powershell', 'shell', 'execute', 'run_in_terminal', 'runinterminal', 'terminal']);
const EDIT_TOOLS = new Set([
  'edit',
  'create',
  'write',
  'multiedit',
  'notebookedit',
  'str_replace',
  'str_replace_editor',
  'apply_patch',
  'insert',
  'create_file',
  'edit_file',
  'replace_string_in_file',
  'multi_replace_string_in_file',
  'edit_notebook_file',
]);

export const isShell = (tool) => SHELL_TOOLS.has(tool.lower);
export const isEdit = (tool) => EDIT_TOOLS.has(tool.lower);

export function shellCommand(tool) {
  const a = tool.args;
  return String(a.command ?? a.cmd ?? a.script ?? a.input ?? '');
}

/** Repo-relative, forward-slash paths of every file an edit tool would touch. */
export function editedPaths(tool) {
  const a = tool.args;
  const found = [];
  for (const key of ['path', 'file_path', 'filePath', 'filename', 'file', 'notebook_path']) {
    if (typeof a[key] === 'string') found.push(a[key]);
  }
  if (Array.isArray(a.replacements)) {
    for (const r of a.replacements) if (typeof r?.filePath === 'string') found.push(r.filePath);
  }
  const patch = typeof a.input === 'string' ? a.input : typeof a.patch === 'string' ? a.patch : '';
  for (const m of patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) found.push(m[1].trim());
  return found.map((p) => toRepoPath(p, tool.cwd));
}

export function patchDeletesFiles(tool) {
  const a = tool.args;
  const patch = typeof a.input === 'string' ? a.input : typeof a.patch === 'string' ? a.patch : '';
  return /^\*\*\* Delete File: /m.test(patch);
}

export function toRepoPath(p, cwd) {
  const abs = path.resolve(cwd, p);
  const rel = path.relative(cwd, abs).split(path.sep).join('/');
  return rel.startsWith('..') ? `<outside-repo>/${abs}` : rel;
}

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        re += '(?:.*/)?';
        i += 2;
      } else {
        re += '.*';
        i += 1;
      }
    } else if (c === '*') {
      re += '[^/]*';
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

export const matchesAny = (p, globs) => globs.some((g) => globToRegExp(g).test(p));

export function deny(reason) {
  process.stdout.write(JSON.stringify({ permissionDecision: 'deny', permissionDecisionReason: reason }));
  process.exit(0);
}

/** No output = no opinion; the normal permission flow continues. */
export function pass() {
  process.exit(0);
}
