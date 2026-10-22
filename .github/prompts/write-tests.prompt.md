---
name: write-tests
description: "Add tests for existing behaviour in a file or folder without touching production code."
argument-hint: "path, e.g. src/domain/contacts.ts"
agent: test-writer
---

Write tests for `${input:target:path to the module or page}`.

1. List the scenarios you will cover (happy path, each validation, not-found, conflict, transitions) **before** writing code.
2. Write the tests following `testing.instructions.md`, run them until green.
3. Do not change production code. If a test exposes a bug, mark it `it.fails` and report it.
4. Finish with `npm run verify` and the list of tests added.
