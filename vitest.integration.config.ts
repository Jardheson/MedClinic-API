import { defineConfig } from 'vitest/config';

process.env.RUN_INTEGRATION_TESTS = 'true';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.spec.ts'],
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
