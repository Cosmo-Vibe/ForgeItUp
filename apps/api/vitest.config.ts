import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@forgeitup/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
