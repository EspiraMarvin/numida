import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/__generated__/**',
        'codegen.ts',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
      ],
    },
  },
});
