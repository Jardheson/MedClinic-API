import { defineConfig } from 'vitest/config';

const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    exclude: runIntegrationTests ? [] : ['tests/integration/**/*.spec.ts'],
    hookTimeout: 60000,
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/server.ts',
        'src/database/**',
        'src/@types/**',
        'src/scripts/**',
        ...(runIntegrationTests ? [] : ['src/repositories/**']),
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
