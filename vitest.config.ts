import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
  },
  bench: {
    globals: true,
    include: ['test/**/*.bench.{js,ts}'],
    environment: 'node',
  },
});
