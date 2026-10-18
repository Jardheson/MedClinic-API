import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.spec.ts'],
    hookTimeout: 60000,
    testTimeout: 60000,
  },
});
