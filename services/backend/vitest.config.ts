import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.pglite.test.ts'],
    fileParallelism: false,
  },
});
