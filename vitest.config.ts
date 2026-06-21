import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/**',
        '.next/**',
        'e2e/**',
        '**/*.d.ts',
        'postcss.config.js',
        'tailwind.config.ts',
        'next.config.mjs',
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
