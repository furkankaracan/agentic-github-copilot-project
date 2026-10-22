// Separate Vitest config for the guardrail hook tests (.github/hooks/**). They spawn Node per case,
// so they run in CI (`npm run test:hooks`) instead of in every agent's `npm test` loop.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['.github/hooks/**/*.test.mjs'],
    environment: 'node',
    testTimeout: 20000,
  },
});
